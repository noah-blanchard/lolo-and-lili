import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const meta = {
  title: "UI/Card",
  component: Card,
  args: {
    children: (
      <>
        <CardTitle>Our little corner</CardTitle>
        <CardDescription>A cozy place for two.</CardDescription>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithContent: Story = {
  args: {
    className: "max-w-sm",
    children: (
      <>
        <CardTitle>Today's cuddle quota</CardTitle>
        <CardDescription>3 of 5 achieved — keep going! 💕</CardDescription>
        <p className="pt-3 text-sm">A soft card holding a tender thought.</p>
      </>
    ),
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardTitle>Chores</CardTitle>
        <CardDescription>2 left</CardDescription>
      </Card>
      <Card>
        <CardTitle>Meals</CardTitle>
        <CardDescription>Planned</CardDescription>
      </Card>
      <Card>
        <CardTitle>Moods</CardTitle>
        <CardDescription>Synced</CardDescription>
      </Card>
      <Card>
        <CardTitle>Dates</CardTitle>
        <CardDescription>Soon</CardDescription>
      </Card>
    </div>
  ),
};
