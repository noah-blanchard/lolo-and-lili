import type { Meta, StoryObj } from "@storybook/react-vite";
import { MealEditor } from "@/components/features/meals/meal-editor";
import type { MealSlot } from "@/lib/schemas/meal";
import { mockMeal } from "../mocks/fixtures";

const meta = {
  title: "Features/Meals/MealEditor",
  component: MealEditor,
} satisfies Meta<typeof MealEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editing: Story = {
  args: {
    date: mockMeal.date,
    slot: mockMeal.slot as MealSlot,
    meal: mockMeal,
    open: true,
    onOpenChange: () => {},
  },
};

export const New: Story = {
  args: {
    date: mockMeal.date,
    slot: "lunch",
    meal: null,
    open: true,
    onOpenChange: () => {},
  },
};
