import type { Meta, StoryObj } from "@storybook/react-vite";
import { CountdownCard } from "@/components/features/dates/countdown-card";
import { mockSpecialDate } from "../mocks/fixtures";

const meta = {
  title: "Features/Dates/CountdownCard",
  component: CountdownCard,
} satisfies Meta<typeof CountdownCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InDays: Story = { args: { item: mockSpecialDate, days: 42 } };

export const Today: Story = {
  args: { item: { ...mockSpecialDate, recurring: false }, days: 0 },
};
