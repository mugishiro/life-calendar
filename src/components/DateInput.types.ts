import type { AppTheme } from '../theme';

export interface DateInputProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  theme: AppTheme;
  placeholder?: string;
  helperText?: string;
  maximumDate?: Date;
  actionLabel?: string;
  closeLabel?: string;
}
