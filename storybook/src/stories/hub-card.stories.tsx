import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heart, PawPrint, CalendarDays, Utensils } from "lucide-react";
import { HubCard } from "@/components/ui/hub-card";

const meta = {
  title: "UI/HubCard",
  component: HubCard,
  args: {
    href: "/pet",
    label: "Pet",
    description: "Your shared companion",
    icon: PawPrint,
  },
  argTypes: {
    icon: {
      control: false,
    },
  },
} satisfies Meta<typeof HubCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDescription: Story = {
  args: { label: "Dates", icon: CalendarDays },
};

export const Grid: Story = {
  render: () => (
    <div className="grid w-80 grid-cols-2 gap-3">
      <HubCard href="/pet" label="Pet" description="Companion" icon={PawPrint} />
      <HubCard href="/meals" label="Meals" description="Plan dinner" icon={Utensils} />
      <HubCard href="/dates" label="Dates" description="Moments" icon={CalendarDays} />
      <HubCard href="/notes" label="Notes" description="Love notes" icon={Heart} />
    </div>
  ),
};
