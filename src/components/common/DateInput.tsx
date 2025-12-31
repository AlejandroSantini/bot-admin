import { TextField } from '@mui/material';
import type { OutlinedTextFieldProps } from '@mui/material';
import type { ChangeEvent } from 'react';

export interface DateInputProps extends Omit<OutlinedTextFieldProps, 'value'> {
  label: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function DateInput({ label, sx, variant = 'outlined', ...props }: DateInputProps) {
  return (
    <TextField
      label={label}
      type="date"
      fullWidth
      size="small"
      sx={{
        borderRadius: 2,
        mb: 2,
        mt: 0,
        '& .MuiInputBase-root': {
          borderRadius: 2,
        },
        ...(sx || {}),
      }}
      variant={variant}
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  );
}

export default DateInput;
