import type { Meta, StoryObj } from "@storybook/react-vite";
import { CoupleNameEditor } from "@/components/features/profile/couple-name-editor";

const meta = {
  title: "Features/Profile/CoupleNameEditor",
  component: CoupleNameEditor,
} satisfies Meta<typeof CoupleNameEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { coupleName: "Maison Lolo & Lili" } };
