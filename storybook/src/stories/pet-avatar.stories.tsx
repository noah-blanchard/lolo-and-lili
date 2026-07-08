import type { Meta, StoryObj } from "@storybook/react-vite";
import { PetAvatar } from "@/components/features/pet/pet-avatar";
import { mockPet, mockPetSleepy } from "../mocks/fixtures";

const meta = {
  title: "Features/Pet/PetAvatar",
  component: PetAvatar,
} satisfies Meta<typeof PetAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { pet: mockPet } };
export const Sleepy: Story = { args: { pet: mockPetSleepy } };
export const Small: Story = { args: { pet: mockPet, size: 80 } };
export const Large: Story = { args: { pet: mockPet, size: 200 } };
export const WithReaction: Story = {
  args: { pet: mockPet, reaction: { id: 1, emoji: "💖" } },
};
