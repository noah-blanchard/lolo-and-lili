import type { Meta, StoryObj } from "@storybook/react-vite";
import { WeekPlanner } from "@/components/features/meals/week-planner";

const meta = {
  title: "Features/Meals/WeekPlanner",
  component: WeekPlanner,
} satisfies Meta<typeof WeekPlanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
