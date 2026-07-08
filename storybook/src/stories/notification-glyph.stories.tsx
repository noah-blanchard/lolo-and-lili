import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationGlyph } from "@/components/features/notifications/notification-glyph";
import type { NotifyCategory } from "@/lib/schemas/push";

const meta = {
  title: "Features/Notifications/NotificationGlyph",
  component: NotificationGlyph,
} satisfies Meta<typeof NotificationGlyph>;

export default meta;
type Story = StoryObj<typeof meta>;

const CATEGORIES: NotifyCategory[] = ["chores", "moods", "status", "pet", "love", "dates", "home"];

export const All: Story = {
  args: { category: "love" },
  render: () => (
    <div className="flex gap-3">
      {CATEGORIES.map((category) => (
        <NotificationGlyph key={category} category={category} />
      ))}
    </div>
  ),
};
