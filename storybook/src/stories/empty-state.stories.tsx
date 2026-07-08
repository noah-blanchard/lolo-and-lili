import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  args: {
    emoji: "🌸",
    title: "Nothing here yet",
    description: "Your first tender moment is just a tap away.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    emoji: "🐾",
    title: "No pets adopted",
    description: "Give your couple a little companion.",
    action: <Button size="sm">Adopt a pet</Button>,
  },
};

export const Plain: Story = {
  args: {
    emoji: "💌",
    title: "No messages",
  },
};
