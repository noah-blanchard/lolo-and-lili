import type { Meta, StoryObj } from "@storybook/react-vite";
import { CouponsBoard } from "@/components/features/coupons/coupons-board";

const meta = {
  title: "Features/Coupons/CouponsBoard",
  component: CouponsBoard,
} satisfies Meta<typeof CouponsBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
