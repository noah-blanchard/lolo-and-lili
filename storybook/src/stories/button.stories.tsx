import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heart, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Button" },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "ghost", "outline"],
    },
    size: { control: "select", options: ["sm", "md", "lg", "icon"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Accent: Story = { args: { variant: "accent" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Outline: Story = { args: { variant: "outline" } };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <Plus />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    children: (
      <>
        <Sparkles /> Make a wish
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Can't touch this" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Button variant="primary">
        <Heart /> Primary
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};

const VARIANTS = ["primary", "secondary", "accent", "ghost", "outline"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-20 text-xs text-muted">{variant}</span>
          {SIZES.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon" variant="primary" aria-label="Add">
        <Plus />
      </Button>
      <Button size="icon" variant="secondary" aria-label="Favorite">
        <Heart />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Sparkle">
        <Sparkles />
      </Button>
    </div>
  ),
};
