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
        borderRadius: 1.5,
        mb: 2,
        mt: 0,
        '& .MuiInputBase-root': {
          borderRadius: 1.5,
          backgroundColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
          border: "1px solid",
          borderColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          '&:hover': {
            borderColor: "primary.main",
          },
          '&.Mui-focused': {
            borderColor: "primary.main",
            boxShadow: (theme: any) => `0 0 0 3px ${theme.palette.primary.main}22`,
          },
          "& fieldset": {
            border: "none",
          },
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
