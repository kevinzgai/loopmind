import type { Meta, StoryObj } from '@storybook/vue3';
import { Input } from '@/components/ui/input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Type something...',
  }
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { Input },
    setup() {
      return { args };
    },
    template: '<Input v-bind="args" />',
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      return { args };
    },
    template: '<Input v-bind="args" />',
  }),
};
