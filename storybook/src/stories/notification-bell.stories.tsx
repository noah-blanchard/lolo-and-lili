import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationBell } from "@/components/features/notifications/notification-bell";

const meta = {
  title: "Features/Notifications/NotificationBell",
  component: NotificationBell,
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
