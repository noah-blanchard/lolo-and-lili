import type { Meta, StoryObj } from "@storybook/react-vite";
import { CountdownList } from "@/components/features/dates/countdown-list";

const meta = {
  title: "Features/Dates/CountdownList",
  component: CountdownList,
} satisfies Meta<typeof CountdownList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
