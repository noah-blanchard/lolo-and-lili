import type { Meta, StoryObj } from "@storybook/react-vite";
import { TreatsCard } from "@/components/features/pet/treats-card";

const meta = {
  title: "Features/Pet/TreatsCard",
  component: TreatsCard,
} satisfies Meta<typeof TreatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
