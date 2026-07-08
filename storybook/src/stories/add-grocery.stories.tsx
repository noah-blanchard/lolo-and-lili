import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddGrocery } from "@/components/features/grocery/add-grocery";

const meta = {
  title: "Features/Grocery/AddGrocery",
  component: AddGrocery,
} satisfies Meta<typeof AddGrocery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
