import type { Meta, StoryObj } from "@storybook/react-vite";
import { PetWidget } from "@/components/features/pet/pet-widget";

const meta = {
  title: "Features/Pet/PetWidget",
  component: PetWidget,
} satisfies Meta<typeof PetWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
