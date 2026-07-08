import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChoreList } from "@/components/features/chores/chore-list";

const meta = {
  title: "Features/Chores/ChoreList",
  component: ChoreList,
} satisfies Meta<typeof ChoreList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
