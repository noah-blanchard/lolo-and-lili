import { ME_ID, PARTNER_ID } from "../fixtures";

const data = [
  { id: "1", user_id: ME_ID, mood: "happy", note: "Belle journée ☀️", created_at: new Date().toISOString() },
  { id: "2", user_id: PARTNER_ID, mood: "calm", created_at: new Date().toISOString() },
  { id: "3", user_id: ME_ID, mood: "tired", created_at: new Date(Date.now() - 3_600_000).toISOString() },
];

export function useAddMood() {
  return { mutate: () => {} };
}
export function useMood() {
  return { data: data[0] };
}
export function useMoods() {
  return { data };
}
