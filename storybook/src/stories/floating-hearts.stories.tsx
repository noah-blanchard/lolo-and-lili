import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FloatingHearts, type FloatingHeartsHandle } from "@/components/features/notes/floating-hearts";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Features/Notes/FloatingHearts",
  component: FloatingHearts,
} satisfies Meta<typeof FloatingHearts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Burst: Story = {
  render: () => {
    const ref = useRef<FloatingHeartsHandle>(null);
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted">Click to float a burst of hearts 💕</p>
        <Button onClick={() => ref.current?.burst()}>Send love</Button>
        <FloatingHearts ref={ref} />
      </div>
    );
  },
};
