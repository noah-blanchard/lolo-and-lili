import type { Meta, StoryObj } from "@storybook/react-vite";
import { MintCoupon } from "@/components/features/coupons/mint-coupon";

const meta = {
  title: "Features/Coupons/MintCoupon",
  component: MintCoupon,
} satisfies Meta<typeof MintCoupon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
