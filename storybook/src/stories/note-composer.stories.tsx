import type { Meta, StoryObj } from "@storybook/react-vite";
import { NoteComposer } from "@/components/features/notes/note-composer";

const meta = {
  title: "Features/Notes/NoteComposer",
  component: NoteComposer,
} satisfies Meta<typeof NoteComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
