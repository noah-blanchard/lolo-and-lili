import type { Meta, StoryObj } from "@storybook/react-vite";
import { BalanceCard } from "@/components/features/expenses/balance-card";
import { mockBalance } from "../mocks/fixtures";

const meta = {
  title: "Features/Expenses/BalanceCard",
  component: BalanceCard,
} satisfies Meta<typeof BalanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Owed: Story = { args: { balance: mockBalance } };
export const Even: Story = { args: { balance: null } };
