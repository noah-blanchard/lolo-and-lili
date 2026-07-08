import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoodPicker } from "@/components/features/moods/mood-picker";

const meta = {
  title: "Features/Moods/MoodPicker",
  component: MoodPicker,
} satisfies Meta<typeof MoodPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
