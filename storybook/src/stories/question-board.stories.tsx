import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestionBoard } from "@/components/features/question/question-board";

const meta = {
  title: "Features/Question/QuestionBoard",
  component: QuestionBoard,
} satisfies Meta<typeof QuestionBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
