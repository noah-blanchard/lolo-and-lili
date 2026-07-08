import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddBucket } from "@/components/features/bucket/add-bucket";

const meta = {
  title: "Features/Bucket/AddBucket",
  component: AddBucket,
} satisfies Meta<typeof AddBucket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
