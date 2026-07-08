import type { Meta, StoryObj } from "@storybook/react-vite";
import { CouponCard } from "@/components/features/coupons/coupon-card";
import { mockCouponMine, mockCouponTheirs, mockCouponUsed } from "../mocks/fixtures";

const meta = {
  title: "Features/Coupons/CouponCard",
  component: CouponCard,
} satisfies Meta<typeof CouponCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SentByMe: Story = { args: { coupon: mockCouponMine } };
export const ToRedeem: Story = { args: { coupon: mockCouponTheirs } };
export const Used: Story = { args: { coupon: mockCouponUsed } };
