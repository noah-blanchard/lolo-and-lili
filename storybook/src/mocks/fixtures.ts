import type { PetView } from "@/lib/pets";
import type { Coupon, BucketItem, GroceryItem, SpecialDate, Meal, PetMemory } from "@/lib/supabase/types";
import type { ChoreWithStatus } from "@/lib/chores";
import type { Balance } from "@/lib/expenses";
import type { AppNotification } from "@/lib/schemas/notification";
import type { Status } from "@/lib/supabase/types";
import type { LoveNote } from "@/lib/supabase/types";
import type { QuestionView } from "@/lib/questions";

export const ME_ID = "me-storybook";
export const PARTNER_ID = "partner-storybook";

// --- Pet ---------------------------------------------------------------
export const mockPet = {
  id: "pet-1",
  name: "Pipou",
  skin: "classic",
  stage: 2,
  status: "ok",
  meters: { hunger: 60, affection: 80, energy: 45, cleanliness: 70 },
  bond: 12,
  cooldowns: { feed: 0, pet: 0, play: 0, groom: 0, gift: 0, heal: 0, cuddle: 0, callback: 0 },
  cuddledToday: false,
  partnerCuddledToday: false,
  equipped: {},
  treats: 5,
  level: 3,
  xp: 120,
} as unknown as PetView;

export const mockPetSleepy = {
  ...mockPet,
  id: "pet-sleep",
  meters: { hunger: 30, affection: 60, energy: 10, cleanliness: 80 },
} as unknown as PetView;

export const mockPetMemories = [
  { id: "m1", pet_id: "pet-1", kind: "adopted", title: "Pipou", emoji: "🐣", created_at: new Date().toISOString(), meta: {} },
  { id: "m2", pet_id: "pet-1", kind: "stageUp", title: "", emoji: "✨", created_at: new Date().toISOString(), meta: {} },
  { id: "m3", pet_id: "pet-1", kind: "unlock", title: "", emoji: "🔓", created_at: new Date().toISOString(), meta: {} },
] as unknown as PetMemory[];

// --- Coupons -----------------------------------------------------------
export const mockCouponMine = {
  id: "c1",
  emoji: "🌹",
  title: "Massage 10 min",
  status: "active",
  created_by: ME_ID,
  cost_treats: 3,
  created_at: new Date().toISOString(),
} as unknown as Coupon;

export const mockCouponTheirs = {
  id: "c2",
  emoji: "☕",
  title: "Café offert",
  status: "active",
  created_by: PARTNER_ID,
  cost_treats: 0,
  created_at: new Date().toISOString(),
} as unknown as Coupon;

export const mockCouponUsed = {
  id: "c3",
  emoji: "🌹",
  title: "Massage 10 min",
  status: "redeemed",
  created_by: ME_ID,
  cost_treats: 3,
  created_at: new Date().toISOString(),
} as unknown as Coupon;

// --- Bucket ------------------------------------------------------------
export const mockBucketItem = {
  id: "b1",
  title: "Week-end à la mer",
  note: "En été",
  done: false,
} as unknown as BucketItem;

export const mockBucketItemDone = {
  id: "b2",
  title: "Voir un lever de soleil",
  note: "",
  done: true,
} as unknown as BucketItem;

// --- Chores ------------------------------------------------------------
export const mockChoreTodo = {
  id: "ch1",
  title: "Faire la vaisselle",
  points: 5,
  assignee_id: ME_ID,
  recurrence: "daily",
  completed_today: false,
  completed_by: null,
} as unknown as ChoreWithStatus;

export const mockChoreDone = {
  id: "ch2",
  title: "Sortir le compost",
  points: 3,
  assignee_id: PARTNER_ID,
  recurrence: "weekly",
  completed_today: true,
  completed_by: PARTNER_ID,
} as unknown as ChoreWithStatus;

// --- Grocery -----------------------------------------------------------
export const mockGroceryItem = {
  id: "g1",
  name: "Lait d'avoine",
  quantity: "2",
  checked: false,
} as unknown as GroceryItem;

export const mockGroceryItemChecked = {
  id: "g2",
  name: "Pâtes",
  quantity: "",
  checked: true,
} as unknown as GroceryItem;

// --- Expenses ----------------------------------------------------------
export const mockBalance = {
  debtorId: PARTNER_ID,
  creditorId: ME_ID,
  amountCents: 4500,
  currency: "EUR",
} as Balance;

// --- Dates -------------------------------------------------------------
export const mockSpecialDate = {
  id: "d1",
  emoji: "💍",
  title: "Notre anniversaire",
  date: "2024-06-15",
  recurring: true,
} as unknown as SpecialDate;

// --- Meals -------------------------------------------------------------
export const mockMeal = {
  id: "m1",
  title: "Risotto aux champignons",
  date: "2025-01-01",
  slot: "dinner",
  cook_id: ME_ID,
  notes: "",
} as unknown as Meal;

// --- Notifications -----------------------------------------------------
export const mockNotification = {
  id: "n1",
  couple_id: "c",
  recipient_id: ME_ID,
  actor_id: PARTNER_ID,
  key: "love_note",
  category: "love",
  title: "Nouveau mot doux",
  body: "Tu me manques 💕",
  target: "",
  target_id: null,
  read: false,
  created_at: new Date().toISOString(),
} as unknown as AppNotification;

export const mockNotificationRead = {
  ...mockNotification,
  id: "n2",
  read: true,
} as unknown as AppNotification;

export const mockNotifications = [mockNotification, mockNotificationRead];

// --- Statuses ----------------------------------------------------------
export const mockStatusMe = {
  user_id: ME_ID,
  couple_id: "couple-storybook",
  state: "free",
  emoji: "🌞",
  note: "",
  updated_at: new Date().toISOString(),
} as unknown as Status;

export const mockStatusPartner = {
  user_id: PARTNER_ID,
  couple_id: "couple-storybook",
  state: "busy",
  emoji: "💻",
  note: "En réunion",
  updated_at: new Date().toISOString(),
} as unknown as Status;

export const mockStatuses = [mockStatusMe, mockStatusPartner];

// --- Love notes --------------------------------------------------------
export const mockLoveNoteMine = {
  id: "ln1",
  couple_id: "couple-storybook",
  author_id: ME_ID,
  body: "Tu es mon soleil ☀️",
  accent: "#ff8fa3",
  created_at: new Date(Date.now() - 3_600_000).toISOString(),
} as unknown as LoveNote;

export const mockLoveNoteTheirs = {
  id: "ln2",
  couple_id: "couple-storybook",
  author_id: PARTNER_ID,
  body: "Merci pour ce matin 💕",
  accent: "#9ee6cf",
  created_at: new Date().toISOString(),
} as unknown as LoveNote;

export const mockLoveNotes = [mockLoveNoteMine, mockLoveNoteTheirs];

// --- Question ----------------------------------------------------------
export const mockQuestionView = {
  date: new Date().toISOString().slice(0, 10),
  questionKey: "fav_memory",
  myAnswer: null,
  partnerAnswer: null,
  revealed: false,
} as unknown as QuestionView;

export const mockQuestionViewRevealed = {
  date: new Date().toISOString().slice(0, 10),
  questionKey: "dream_trip",
  myAnswer: "Le Japon 🗾",
  partnerAnswer: "La Norvège 🏔️",
  revealed: true,
} as unknown as QuestionView;
