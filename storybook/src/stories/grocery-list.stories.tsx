import type { Meta, StoryObj } from "@storybook/react-vite";
import { GroceryList } from "@/components/features/grocery/grocery-list";

const meta = {
  title: "Features/Grocery/GroceryList",
  component: GroceryList,
} satisfies Meta<typeof GroceryList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
