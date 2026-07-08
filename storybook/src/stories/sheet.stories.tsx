import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const meta = {
  title: "UI/Sheet",
  component: Sheet,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTrigger: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Sheet
        open={open}
        onOpenChange={setOpen}
        trigger={<Button>Open sheet</Button>}
        title="Cuddle settings"
        description="Tune your cozy little preferences."
      >
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm">Enable night snuggles</span>
          <Switch checked onChange={() => {}} label="Night snuggles" />
        </div>
      </Sheet>
    );
  },
};

export const ControlledOpen: Story = {
  render: () => (
    <Sheet
      open
      title="A sweet surprise"
      description="This sheet starts open."
    >
      <p className="text-sm text-muted">Drag down to dismiss. 💕</p>
    </Sheet>
  ),
};
