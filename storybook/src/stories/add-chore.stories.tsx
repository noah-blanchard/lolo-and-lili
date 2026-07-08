import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddChore } from "@/components/features/chores/add-chore";

const meta = {
  title: "Features/Chores/AddChore",
  component: AddChore,
} satisfies Meta<typeof AddChore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
