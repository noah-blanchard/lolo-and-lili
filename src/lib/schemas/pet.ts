import { z } from "zod";
import { SKINS } from "@/lib/pets";

const CARE_TYPES = [
  "feed",
  "pet",
  "play",
  "groom",
  "heal",
  "gift",
  "cuddle",
  "callback",
] as const;

export const adoptPetSchema = z.object({
  name: z.string().trim().min(1).max(24),
  skin: z.enum(SKINS).default("classic"),
});
export type AdoptPetInput = z.infer<typeof adoptPetSchema>;

export const careSchema = z.object({ type: z.enum(CARE_TYPES) });
export type CareInput = z.infer<typeof careSchema>;

export const renamePetSchema = z.object({
  name: z.string().trim().min(1).max(24),
});

export const equipSchema = z.object({
  slot: z.enum(["hat", "collar"]),
  itemId: z.string().nullable(), // null = unequip
});
export type EquipInput = z.infer<typeof equipSchema>;
