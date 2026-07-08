import type { Meta, StoryObj } from "@storybook/react-vite";
import { PetActions } from "@/components/features/pet/pet-actions";
import { mockPet } from "../mocks/fixtures";

const meta = {
  title: "Features/Pet/PetActions",
  component: PetActions,
} satisfies Meta<typeof PetActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { pet: mockPet, onReaction: () => {} } };

export const Sick: Story = {
  args: { pet: { ...mockPet, status: "sick" }, onReaction: () => {} },
};
