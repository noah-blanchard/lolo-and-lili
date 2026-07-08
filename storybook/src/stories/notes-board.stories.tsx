import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotesBoard } from "@/components/features/notes/notes-board";

const meta = {
  title: "Features/Notes/NotesBoard",
  component: NotesBoard,
} satisfies Meta<typeof NotesBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
