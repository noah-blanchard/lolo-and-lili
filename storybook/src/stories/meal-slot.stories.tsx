import type { Meta, StoryObj } from "@storybook/react-vite";
import { MealSlot } from "@/components/features/meals/meal-slot";
import { mockMeal } from "../mocks/fixtures";

const meta = {
  title: "Features/Meals/MealSlot",
  component: MealSlot,
} satisfies Meta<typeof MealSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { date: "2025-01-01", slot: "dinner", meal: null },
};

export const Filled: Story = {
  args: { date: "2025-01-01", slot: "lunch", meal: mockMeal },
};
