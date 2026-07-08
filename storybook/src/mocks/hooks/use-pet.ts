import { mockPet, mockPetMemories } from "../fixtures";

export function useCarePet() {
  return { mutate: () => {}, mutateAsync: async () => undefined, isPending: false };
}
export function usePetMemories() {
  return { data: mockPetMemories };
}
export function usePet() {
  return { data: mockPet };
}
export function useAdoptPet() {
  return { mutate: () => {}, isPending: false };
}
export function useTreats() {
  return { data: mockPet.treats };
}
