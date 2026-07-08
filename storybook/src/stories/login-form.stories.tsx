import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoginForm } from "@/components/features/auth/login-form";

const meta = {
  title: "Features/Auth/LoginForm",
  component: LoginForm,
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
