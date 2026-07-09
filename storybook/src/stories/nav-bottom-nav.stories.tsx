import type { Meta, StoryObj } from "@storybook/react-vite";
import { BottomNav } from "@/components/nav/bottom-nav";
import { setMockPathname } from "../mocks/navigation";

const meta = {
  title: "Nav/BottomNav",
  component: BottomNav,
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeCenterActive: Story = {
  render: () => {
    setMockPathname("/");
    return <BottomNav />;
  },
};

export const MaisonActive: Story = {
  render: () => {
    setMockPathname("/chores");
    return <BottomNav />;
  },
};

export const NousActive: Story = {
  render: () => {
    setMockPathname("/notes");
    return <BottomNav />;
  },
};

export const ProfileActive: Story = {
  render: () => {
    setMockPathname("/profile");
    return <BottomNav />;
  },
};

export const PetActive: Story = {
  render: () => {
    setMockPathname("/pet");
    return <BottomNav />;
  },
};
