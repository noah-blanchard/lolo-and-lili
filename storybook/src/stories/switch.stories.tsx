import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@/components/ui/switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  args: { checked: false, onChange: () => {} },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Switch checked={checked} onChange={setChecked} label="Notifications" />;
  },
};

export const On: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch checked={checked} onChange={setChecked} label="Notifications" />;
  },
};

export const Disabled: Story = {
  render: () => <Switch checked={false} disabled onChange={() => {}} label="Locked" />,
};

export const Pair: Story = {
  render: () => {
    const [a, setA] = useState(true);
    const [b, setB] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Switch checked={a} onChange={setA} label="Push" />
          <span className="text-sm">Push hugs</span>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={b} onChange={setB} label="Quiet" />
          <span className="text-sm">Quiet hours</span>
        </div>
      </div>
    );
  },
};
