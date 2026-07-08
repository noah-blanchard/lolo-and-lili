import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileEditor } from "@/components/features/profile/profile-editor";

const meta = {
  title: "Features/Profile/ProfileEditor",
  component: ProfileEditor,
} satisfies Meta<typeof ProfileEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
