import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationsCard } from "@/components/features/notifications/notifications-card";
import { DEFAULT_NOTIFICATION_PREFS } from "@/lib/schemas/push";

const meta = {
  title: "Features/Notifications/NotificationsCard",
  component: NotificationsCard,
} satisfies Meta<typeof NotificationsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { initialPrefs: DEFAULT_NOTIFICATION_PREFS } };
