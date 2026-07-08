import type { Meta, StoryObj } from "@storybook/react-vite";
import { LocaleSwitcher } from "@/components/nav/locale-switcher";

const meta = {
  title: "Nav/LocaleSwitcher",
  component: LocaleSwitcher,
} satisfies Meta<typeof LocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
