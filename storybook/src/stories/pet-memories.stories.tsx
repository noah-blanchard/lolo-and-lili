import type { Meta, StoryObj } from "@storybook/react-vite";
import { PetMemories } from "@/components/features/pet/pet-memories";

const meta = {
  title: "Features/Pet/PetMemories",
  component: PetMemories,
} satisfies Meta<typeof PetMemories>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
