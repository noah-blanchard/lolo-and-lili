export function useSettleUp() {
  return { mutate: () => {}, isPending: false };
}
export function useAddExpense() {
  return { mutate: () => {}, isPending: false };
}
export function useExpenses() {
  return { data: { expenses: [], balance: null } };
}
