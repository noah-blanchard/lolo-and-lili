import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationPanel } from "@/components/features/notifications/notification-panel";

const meta = {
  title: "Features/Notifications/NotificationPanel",
  component: NotificationPanel,
} satisfies Meta<typeof NotificationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = { args: { open: true, onOpenChange: () => {} } };
export const Closed: Story = { args: { open: false, onOpenChange: () => {} } };
