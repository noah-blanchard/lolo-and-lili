import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpinJar } from "@/components/features/bucket/spin-jar";

const meta = {
  title: "Features/Bucket/SpinJar",
  component: SpinJar,
} satisfies Meta<typeof SpinJar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
