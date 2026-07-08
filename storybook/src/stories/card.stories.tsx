import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export const WithAction: Story = {
  args: {
    className: "max-w-sm",
    children: (
      <>
        <CardTitle>Surprise scheduled</CardTitle>
        <CardDescription>A cozy movie night is set for Friday.</CardDescription>
        <div className="pt-4">
          <Button size="sm" variant="accent">
            View details
          </Button>
        </div>
      </>
    ),
  },
};
