import type { Meta, StoryObj } from "@storybook/react-vite";
import { BucketItem } from "@/components/features/bucket/bucket-item";
import { mockBucketItem, mockBucketItemDone } from "../mocks/fixtures";

const meta = {
  title: "Features/Bucket/BucketItem",
  component: BucketItem,
} satisfies Meta<typeof BucketItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = { args: { item: mockBucketItem } };
export const Done: Story = { args: { item: mockBucketItemDone } };
