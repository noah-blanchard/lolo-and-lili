import type { Meta, StoryObj } from "@storybook/react-vite";
import { GroceryItem } from "@/components/features/grocery/grocery-item";
import { mockGroceryItem, mockGroceryItemChecked } from "../mocks/fixtures";

const meta = {
  title: "Features/Grocery/GroceryItem",
  component: GroceryItem,
} satisfies Meta<typeof GroceryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = { args: { item: mockGroceryItem } };
export const Checked: Story = { args: { item: mockGroceryItemChecked } };
