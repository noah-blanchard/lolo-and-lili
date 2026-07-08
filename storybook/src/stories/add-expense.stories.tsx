import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddExpense } from "@/components/features/expenses/add-expense";

const meta = {
  title: "Features/Expenses/AddExpense",
  component: AddExpense,
} satisfies Meta<typeof AddExpense>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
