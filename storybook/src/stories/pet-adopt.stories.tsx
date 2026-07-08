import type { Meta, StoryObj } from "@storybook/react-vite";
import { PetAdopt } from "@/components/features/pet/pet-adopt";

const meta = {
  title: "Features/Pet/PetAdopt",
  component: PetAdopt,
} satisfies Meta<typeof PetAdopt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
