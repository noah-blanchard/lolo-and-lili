import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedToggle, type SegmentOption } from "@/components/ui/segmented-toggle";

const meta = {
  title: "UI/SegmentedToggle",
  component: SegmentedToggle,
  args: { options: [], value: "", onChange: () => {} },
} satisfies Meta<typeof SegmentedToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

type View = "together" | "mine" | "theirs";

const options: SegmentOption<View>[] = [
  { value: "together", label: "Together" },
  { value: "mine", label: "Mine" },
  { value: "theirs", label: "Theirs" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<View>("together");
    return (
      <div className="w-80">
        <SegmentedToggle options={options} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithActiveColor: Story = {
  render: () => {
    const [value, setValue] = useState<View>("mine");
    return (
      <div className="w-80">
        <SegmentedToggle
          options={[
            { value: "together", label: "Together", activeClassName: "bg-primary" },
            { value: "mine", label: "Mine", activeClassName: "bg-accent" },
            { value: "theirs", label: "Theirs", activeClassName: "bg-secondary" },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};

type Mood = "free" | "busy";

export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = useState<Mood>("free");
    return (
      <div className="w-72">
        <SegmentedToggle<Mood>
          value={value}
          onChange={setValue}
          options={[
            { value: "free", label: <>🌿 Free</>, activeClassName: "bg-free/25" },
            { value: "busy", label: <>⏳ Busy</>, activeClassName: "bg-busy/25" },
          ]}
        />
      </div>
    );
  },
};

type Day = "mon" | "tue" | "wed" | "thu";

export const FourOptions: Story = {
  render: () => {
    const [value, setValue] = useState<Day>("mon");
    return (
      <div className="w-96">
        <SegmentedToggle<Day>
          value={value}
          onChange={setValue}
          options={[
            { value: "mon", label: "Mon" },
            { value: "tue", label: "Tue" },
            { value: "wed", label: "Wed" },
            { value: "thu", label: "Thu" },
          ]}
        />
      </div>
    );
  },
};
