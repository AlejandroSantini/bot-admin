import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { ChangeEvent, ReactNode } from 'react';

export interface InputProps extends Omit<TextFieldProps, 'value'> {
  label: string;
  icon?: ReactNode;
  type?: string;
  error?: boolean;
  helperText?: ReactNode;
  value?: string | number | (string | number)[];
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  endAdornment?: ReactNode;
}

export function Input({ label, icon, type, sx, variant = 'outlined', endAdornment, ...props }: InputProps) {
  return (
    <TextField
      label={label}
      type={type}
      fullWidth
      size="small"
      sx={{
        borderRadius: 2,
        mb: 2,
        mt: 0,
        '& .MuiInputBase-root': {
          borderRadius: 2,
          backgroundColor: 'background.paper',
          '& input': {
            color: 'text.primary',
          }
        },
        '& input:-webkit-autofill': {
          WebkitBoxShadow: (theme: any) => `0 0 0 100px ${theme.palette.background.paper} inset !important`,
          WebkitTextFillColor: (theme: any) => `${theme.palette.text.primary} !important`,
          transition: 'background-color 5000s ease-in-out 0s !important',
        },
        ...(sx || {}),
      }}
      variant={variant}
      slotProps={{
        input: {
          startAdornment: icon,
          endAdornment: endAdornment,
        },
      }}
      {...props}
    />
  );
}
