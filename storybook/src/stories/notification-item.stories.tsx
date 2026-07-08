import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationItem } from "@/components/features/notifications/notification-item";
import { mockNotification, mockNotificationRead } from "../mocks/fixtures";

const meta = {
  title: "Features/Notifications/NotificationItem",
  component: NotificationItem,
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {
  args: { notification: mockNotification, onOpen: () => {}, onMarkRead: () => {} },
};

export const Read: Story = {
  args: { notification: mockNotificationRead, onOpen: () => {}, onMarkRead: () => {} },
};
