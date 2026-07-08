export function useNudgeState() {
  return { data: { cooldowns: {} } };
}
export function useSendNudge() {
  return { mutate: () => {}, isPending: false };
}
