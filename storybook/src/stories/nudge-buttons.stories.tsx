import type { Meta, StoryObj } from "@storybook/react-vite";
import { NudgeButtons } from "@/components/features/nudge/nudge-buttons";

const meta = {
  title: "Features/Nudge/NudgeButtons",
  component: NudgeButtons,
} satisfies Meta<typeof NudgeButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
