import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotesWall } from "@/components/features/notes/notes-wall";

const meta = {
  title: "Features/Notes/NotesWall",
  component: NotesWall,
} satisfies Meta<typeof NotesWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
