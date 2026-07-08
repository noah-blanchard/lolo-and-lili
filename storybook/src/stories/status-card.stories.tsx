import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusCard } from "@/components/features/status/status-card";

const meta = {
  title: "Features/Status/StatusCard",
  component: StatusCard,
} satisfies Meta<typeof StatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
