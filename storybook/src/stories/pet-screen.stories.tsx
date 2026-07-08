import type { Meta, StoryObj } from "@storybook/react-vite";
import { PetScreen } from "@/components/features/pet/pet-screen";

const meta = {
  title: "Features/Pet/PetScreen",
  component: PetScreen,
} satisfies Meta<typeof PetScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPet: Story = {};
