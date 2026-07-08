import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoodTimeline } from "@/components/features/moods/mood-timeline";

const meta = {
  title: "Features/Moods/MoodTimeline",
  component: MoodTimeline,
} satisfies Meta<typeof MoodTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
