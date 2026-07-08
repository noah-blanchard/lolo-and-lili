import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationList } from "@/components/features/notifications/notification-list";
import { mockNotifications } from "../mocks/fixtures";

const meta = {
  title: "Features/Notifications/NotificationList",
  component: NotificationList,
} satisfies Meta<typeof NotificationList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithUnread: Story = {
  args: {
    items: mockNotifications,
    hasUnread: true,
    onOpen: () => {},
    onMarkRead: () => {},
    onMarkAll: () => {},
  },
};

export const AllRead: Story = {
  args: {
    items: mockNotifications.map((n) => ({ ...n, read: true })),
    hasUnread: false,
    onOpen: () => {},
    onMarkRead: () => {},
    onMarkAll: () => {},
  },
};

export const Empty: Story = {
  args: {
    items: [],
    hasUnread: false,
    onOpen: () => {},
    onMarkRead: () => {},
    onMarkAll: () => {},
  },
};
