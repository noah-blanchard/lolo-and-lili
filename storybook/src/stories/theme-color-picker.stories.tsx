import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeColorPicker } from "@/components/features/profile/theme-color-picker";

const meta = {
  title: "Features/Profile/ThemeColorPicker",
  component: ThemeColorPicker,
} satisfies Meta<typeof ThemeColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
