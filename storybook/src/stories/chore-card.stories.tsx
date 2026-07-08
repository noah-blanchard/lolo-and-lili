import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChoreCard } from "@/components/features/chores/chore-card";
import { mockChoreTodo, mockChoreDone } from "../mocks/fixtures";

const meta = {
  title: "Features/Chores/ChoreCard",
  component: ChoreCard,
} satisfies Meta<typeof ChoreCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = { args: { chore: mockChoreTodo } };
export const Done: Story = { args: { chore: mockChoreDone } };
