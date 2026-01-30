import type { Meta, StoryObj } from '@storybook/vue3';
import ThemeToggle from '@/components/ThemeToggle.vue';

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
