import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Pet, PetMemory } from "@/lib/supabase/types";
import { ApiError, ErrorCode, fail } from "@/lib/api/result";
import { today } from "@/lib/chores";
import { requireCoupleId } from "./couples";
import {
  applyCare,
  cooldownRemaining,
  decayMeters,
  settle,
  statusOf,
  TREAT_COST,
  type Meters,
  type PetActionType,
  type PetEvent,
  type PetView,
  type CareResult,
} from "@/lib/pets";
import type { AdoptPetInput, CareInput, EquipInput } from "@/lib/schemas/pet";
import type { NotifyKey } from "@/lib/notifications/messages";
import { notifyPartner } from "./notifications";

type DB = SupabaseClient<Database>;

const CARE_TYPES: PetActionType[] = [
  "feed",
  "pet",
  "play",
  "groom",
  "heal",
  "gift",
];
/** Both partners must call within this window to coax the cat home. */
const CALLBACK_WINDOW_MS = 6 * 3_600_000;

function startOfTodayISO(): string {
  return `${today()}T00:00:00.000Z`;
}

async function fetchPetRow(supabase: DB, coupleId: string): Promise<Pet | null> {
  const { data } = await supabase
    .from("pets")
    .select("*")
    .eq("couple_id", coupleId)
    .maybeSingle();
  return data ?? null;
}

/** Settled pet + cooldowns + today's cuddle state, or null if not adopted. */
export async function getPet(
  supabase: DB,
  coupleId: string,
  userId: string,
): Promise<PetView | null> {
  const pet = await fetchPetRow(supabase, coupleId);
  if (!pet) return null;

  const now = new Date();
  const state = settle(pet, now);

  // Latest action per type → remaining cooldowns.
  const { data: actions } = await supabase
    .from("pet_actions")
    .select("type, performed_by, created_at")
    .eq("pet_id", pet.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const lastOf: Record<string, string> = {};
  for (const a of actions ?? []) {
    if (!(a.type in lastOf)) lastOf[a.type] = a.created_at;
  }
  const cooldowns: Record<string, number> = {};
  for (const t of CARE_TYPES) {
    cooldowns[t] = cooldownRemaining(t, lastOf[t] ?? null, now);
  }

  const start = startOfTodayISO();
  const todaysCuddlers = new Set(
    (actions ?? [])
      .filter((a) => a.type === "cuddle" && a.created_at >= start)
      .map((a) => a.performed_by),
  );

  return {
    ...state,
    cooldowns,
    cuddledToday: todaysCuddlers.has(userId),
    partnerCuddledToday: [...todaysCuddlers].some((id) => id && id !== userId),
  };
}

export async function listMemories(
  supabase: DB,
  coupleId: string,
): Promise<PetMemory[]> {
  const { data } = await supabase
    .from("pet_memories")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false })
    .limit(30);
  return data ?? [];
}

export async function adoptPet(
  supabase: DB,
  user: User,
  input: AdoptPetInput,
): Promise<PetView> {
  const coupleId = await requireCoupleId(supabase, user);
  const existing = await fetchPetRow(supabase, coupleId);
  if (existing) throw fail.conflict("You already have a pet");

  const { data, error } = await supabase
    .from("pets")
    .insert({
      couple_id: coupleId,
      name: input.name,
      skin: input.skin,
      created_by: user.id,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to adopt pet");
  }

  await insertMemory(supabase, coupleId, data.id, {
    kind: "adopted",
    title: input.name,
    emoji: "🐱",
  });

  const view = await getPet(supabase, coupleId, user.id);
  return view!;
}

export async function care(
  supabase: DB,
  user: User,
  input: CareInput,
): Promise<CareResult> {
  const coupleId = await requireCoupleId(supabase, user);
  const pet = await fetchPetRow(supabase, coupleId);
  if (!pet) throw fail.notFound("No pet yet — adopt one first");

  const now = new Date();
  const type = input.type;
  const meters = decayMeters(pet, now);
  const status = statusOf(pet, meters);

  // Away ⇒ only a co-op call-back is allowed; otherwise call-back is invalid.
  if (status === "away" && type !== "callback") {
    throw fail.forbidden("Your cat wandered off — call it back together 🥺");
  }
  if (status !== "away" && type === "callback") {
    throw new ApiError(ErrorCode.VALIDATION, "Your cat is right here 🐱");
  }

  // Cooldown (non-cuddle/callback).
  if (CARE_TYPES.includes(type)) {
    const { data: last } = await supabase
      .from("pet_actions")
      .select("created_at")
      .eq("pet_id", pet.id)
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cooldownRemaining(type, last?.created_at ?? null, now) > 0) {
      throw new ApiError(ErrorCode.CONFLICT, "Give it a little bit — on cooldown ⏳");
    }
  }

  // Treat cost.
  const cost = TREAT_COST[type] ?? 0;
  if (cost > 0 && pet.treats < cost) {
    throw new ApiError(ErrorCode.FORBIDDEN, "Not enough treats — do a chore together 🪙");
  }

  // Record the action first (drives realtime, cooldowns, co-op detection).
  await supabase.from("pet_actions").insert({
    couple_id: coupleId,
    pet_id: pet.id,
    type,
    performed_by: user.id,
  });

  const events: PetEvent[] = [];
  let patch: Partial<Pet> = {};
  let notify: NotifyKey | null = null;

  if (type === "cuddle") {
    // Once per day per person; the co-op day completes when BOTH have cuddled.
    const already = await hasActionToday(supabase, pet.id, "cuddle", user.id, now);
    if (already) {
      throw new ApiError(ErrorCode.CONFLICT, "Already cuddled today 💕");
    }
    const partnerCuddled = await partnerActedToday(
      supabase,
      pet.id,
      "cuddle",
      user.id,
      now,
    );
    let streakCount = pet.streak_count;
    if (partnerCuddled && pet.streak_last_day !== today()) {
      streakCount = pet.streak_last_day === yesterday() ? pet.streak_count + 1 : 1;
    }
    const applied = applyCare(pet, "cuddle", streakCount, now);
    patch = { ...applied.store };
    events.push(...applied.events);
    if (partnerCuddled && pet.streak_last_day !== today()) {
      patch.streak_count = streakCount;
      patch.streak_last_day = today();
      events.push({ kind: "streak", value: String(streakCount) });
    } else if (!partnerCuddled) {
      // Nudge the partner to cuddle back and complete today's co-op streak.
      notify = "pet_cuddle";
    }
  } else if (type === "callback") {
    // Coax home: needs BOTH partners within the window.
    const bothCalled = await partnerActedWithin(
      supabase,
      pet.id,
      "callback",
      user.id,
      CALLBACK_WINDOW_MS,
      now,
    );
    if (!bothCalled) {
      // Waiting on the other partner — no recovery yet. Ask them to help call.
      await notifyPartner({ actorId: user.id, coupleId, message: "pet_callback" });
      const view = await getPet(supabase, coupleId, user.id);
      return { pet: view!, events: [] };
    }
    const applied = applyCare(pet, "callback", pet.streak_count, now);
    patch = { ...applied.store, treats: pet.treats };
    events.push(...applied.events);
  } else {
    const applied = applyCare(pet, type, pet.streak_count, now);
    patch = { ...applied.store };
    events.push(...applied.events);
    if (cost > 0) patch.treats = pet.treats - cost;
  }

  const { error: updateError } = await supabase
    .from("pets")
    .update(patch)
    .eq("id", pet.id);
  if (updateError) {
    throw new ApiError(ErrorCode.INTERNAL, updateError.message);
  }

  if (notify) {
    await notifyPartner({ actorId: user.id, coupleId, message: notify });
  }

  // Persist milestones as memories.
  for (const ev of events) {
    if (ev.kind === "levelUp" || ev.kind === "adopted") continue;
    await insertMemory(supabase, coupleId, pet.id, memoryFor(ev, pet.name));
  }

  const view = await getPet(supabase, coupleId, user.id);
  return { pet: view!, events };
}

export async function renamePet(
  supabase: DB,
  user: User,
  name: string,
): Promise<PetView> {
  const coupleId = await requireCoupleId(supabase, user);
  await supabase.from("pets").update({ name }).eq("couple_id", coupleId);
  const view = await getPet(supabase, coupleId, user.id);
  if (!view) throw fail.notFound("No pet yet");
  return view;
}

export async function equip(
  supabase: DB,
  user: User,
  input: EquipInput,
): Promise<PetView> {
  const coupleId = await requireCoupleId(supabase, user);
  const pet = await fetchPetRow(supabase, coupleId);
  if (!pet) throw fail.notFound("No pet yet");

  const unlocked = Array.isArray(pet.unlocked) ? (pet.unlocked as string[]) : [];
  if (input.itemId && !unlocked.includes(input.itemId)) {
    throw new ApiError(ErrorCode.FORBIDDEN, "Not unlocked yet 🔒");
  }
  const equipped = { ...(pet.equipped as Record<string, string | null>) };
  if (input.itemId) equipped[input.slot] = input.itemId;
  else delete equipped[input.slot];

  await supabase.from("pets").update({ equipped }).eq("id", pet.id);
  const view = await getPet(supabase, coupleId, user.id);
  return view!;
}

// --- Cross-feature "mirror" helpers (no-op when the couple has no pet) -------

/**
 * Spend treats from the shared wallet (e.g. redeeming a love coupon).
 * Throws CONFLICT if there's no pet or not enough treats.
 */
export async function spendTreats(
  supabase: DB,
  user: User,
  amount: number,
): Promise<void> {
  if (amount <= 0) return;
  const coupleId = await requireCoupleId(supabase, user);
  const pet = await fetchPetRow(supabase, coupleId);
  if (!pet || pet.treats < amount) {
    throw new ApiError(ErrorCode.CONFLICT, "Not enough treats — do a chore together 🪙");
  }
  await supabase.from("pets").update({ treats: pet.treats - amount }).eq("id", pet.id);
}

/**
 * Add treats to the shared wallet (e.g. answering the question of the day or a
 * daily mood check-in). No-op when the couple hasn't adopted a pet yet — the
 * wallet lives on the pet row, so there's nowhere to bank them.
 */
export async function awardTreats(
  supabase: DB,
  user: User,
  amount: number,
): Promise<void> {
  if (amount <= 0) return;
  const coupleId = await requireCoupleId(supabase, user).catch(() => null);
  if (!coupleId) return;
  const pet = await fetchPetRow(supabase, coupleId);
  if (!pet) return;
  await supabase
    .from("pets")
    .update({ treats: pet.treats + Math.round(amount) })
    .eq("id", pet.id);
}

/** Chores award/refund treats (the economy) + a small energy nudge on complete. */
export async function rewardFromChore(
  supabase: DB,
  user: User,
  points: number,
  undo: boolean,
): Promise<void> {
  const coupleId = await requireCoupleId(supabase, user).catch(() => null);
  if (!coupleId) return;
  const pet = await fetchPetRow(supabase, coupleId);
  if (!pet) return;

  const treats = Math.max(0, pet.treats + (undo ? -points : points));
  await supabase.from("pets").update({ treats }).eq("id", pet.id);
  if (!undo) await nourish(supabase, pet, { energy: 5, cleanliness: 3 });
}

/** Logging a mood nourishes the cat's heart. */
export async function nourishFromMood(
  supabase: DB,
  user: User,
): Promise<void> {
  const coupleId = await requireCoupleId(supabase, user).catch(() => null);
  if (!coupleId) return;
  const pet = await fetchPetRow(supabase, coupleId);
  if (!pet) return;
  await nourish(supabase, pet, { affection: 6, energy: 6 });
}

async function nourish(
  supabase: DB,
  pet: Pet,
  deltas: Partial<Meters>,
): Promise<void> {
  const now = new Date();
  const m = decayMeters(pet, now);
  // Meter columns are integers — round so PostgREST doesn't reject the update.
  const clamp = (n: number) => Math.round(Math.max(0, Math.min(100, n)));
  await supabase
    .from("pets")
    .update({
      hunger: clamp(m.hunger + (deltas.hunger ?? 0)),
      affection: clamp(m.affection + (deltas.affection ?? 0)),
      energy: clamp(m.energy + (deltas.energy ?? 0)),
      cleanliness: clamp(m.cleanliness + (deltas.cleanliness ?? 0)),
      meters_at: now.toISOString(),
    })
    .eq("id", pet.id);
}

// --- small helpers ----------------------------------------------------------

function yesterday(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function hasActionToday(
  supabase: DB,
  petId: string,
  type: PetActionType,
  userId: string,
  now: Date,
): Promise<boolean> {
  const { count } = await supabase
    .from("pet_actions")
    .select("id", { count: "exact", head: true })
    .eq("pet_id", petId)
    .eq("type", type)
    .eq("performed_by", userId)
    .gte("created_at", `${today()}T00:00:00.000Z`)
    // exclude the row we just inserted (this call happens after insert)
    .lt("created_at", now.toISOString());
  return (count ?? 0) > 0;
}

async function partnerActedToday(
  supabase: DB,
  petId: string,
  type: PetActionType,
  userId: string,
  now: Date,
): Promise<boolean> {
  const { data } = await supabase
    .from("pet_actions")
    .select("performed_by")
    .eq("pet_id", petId)
    .eq("type", type)
    .neq("performed_by", userId)
    .gte("created_at", `${today()}T00:00:00.000Z`)
    .lte("created_at", now.toISOString())
    .limit(1);
  return (data?.length ?? 0) > 0;
}

async function partnerActedWithin(
  supabase: DB,
  petId: string,
  type: PetActionType,
  userId: string,
  windowMs: number,
  now: Date,
): Promise<boolean> {
  const since = new Date(now.getTime() - windowMs).toISOString();
  const { data } = await supabase
    .from("pet_actions")
    .select("performed_by")
    .eq("pet_id", petId)
    .eq("type", type)
    .neq("performed_by", userId)
    .gte("created_at", since)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

async function insertMemory(
  supabase: DB,
  coupleId: string,
  petId: string,
  m: { kind: string; title: string; emoji: string; meta?: unknown },
): Promise<void> {
  await supabase.from("pet_memories").insert({
    couple_id: coupleId,
    pet_id: petId,
    kind: m.kind,
    title: m.title,
    emoji: m.emoji,
    meta: (m.meta ?? {}) as never,
  });
}

function memoryFor(
  ev: PetEvent,
  petName: string,
): { kind: string; title: string; emoji: string; meta: unknown } {
  switch (ev.kind) {
    case "stageUp":
      return { kind: "stageUp", title: `${petName} grew up!`, emoji: "🐈", meta: { stage: ev.value } };
    case "unlock":
      return { kind: "unlock", title: "Unlocked an accessory", emoji: "🎁", meta: { item: ev.value } };
    case "streak":
      return { kind: "streak", title: `${ev.value}-day cuddle streak`, emoji: "🔥", meta: { streak: ev.value } };
    case "recovered":
      return { kind: "recovered", title: `${petName} came home`, emoji: "🏡", meta: {} };
    default:
      return { kind: ev.kind, title: ev.kind, emoji: "✨", meta: {} };
  }
}
