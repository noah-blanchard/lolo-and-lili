import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddDate } from "@/components/features/dates/add-date";

const meta = {
  title: "Features/Dates/AddDate",
  component: AddDate,
} satisfies Meta<typeof AddDate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
