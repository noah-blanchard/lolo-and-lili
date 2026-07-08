import type { Meta, StoryObj } from "@storybook/react-vite";
import { BucketList } from "@/components/features/bucket/bucket-list";

const meta = {
  title: "Features/Bucket/BucketList",
  component: BucketList,
} satisfies Meta<typeof BucketList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
