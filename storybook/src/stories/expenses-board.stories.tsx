import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExpensesBoard } from "@/components/features/expenses/expenses-board";

const meta = {
  title: "Features/Expenses/ExpensesBoard",
  component: ExpensesBoard,
} satisfies Meta<typeof ExpensesBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
