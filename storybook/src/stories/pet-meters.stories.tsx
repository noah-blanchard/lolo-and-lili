import type { Meta, StoryObj } from "@storybook/react-vite";
import { PetMeters } from "@/components/features/pet/pet-meters";
import { mockPet, mockPetSleepy } from "../mocks/fixtures";

const meta = {
  title: "Features/Pet/PetMeters",
  component: PetMeters,
} satisfies Meta<typeof PetMeters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy: Story = { args: { pet: mockPet } };
export const LowEnergy: Story = { args: { pet: mockPetSleepy } };
