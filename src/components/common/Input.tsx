import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useThemeMode } from "../../providers/ThemeModeProvider";

export interface InputProps extends Omit<TextFieldProps, "value"> {
  label: string;
  icon?: ReactNode;
  type?: string;
  error?: boolean;
  helperText?: ReactNode;
  value?: string | number | (string | number)[];
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  endAdornment?: ReactNode;
}

export function Input({
  label,
  icon,
  type,
  sx,
  variant = "outlined",
  endAdornment,
  ...props
}: InputProps) {
  const { mode } = useThemeMode();
  return (
    <TextField
      label={label}
      type={type}
      fullWidth
      size="small"
      sx={{
        mb: 2,
        mt: 0,
        "& .MuiInputBase-root": {
          borderRadius: 1.5,
          height: props.multiline ? 'auto' : 40,
          minHeight: props.multiline ? 80 : 40,
          backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
          transition: "all 0.2s ease-in-out",
          border: "1px solid",
          borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
          },
          "&.Mui-focused": {
            borderColor: "primary.main",
            boxShadow: (theme: any) => `0 0 0 3px ${theme.palette.primary.main}22`,
            backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
          },
          "& fieldset": {
            border: "none",
          },
          "& input": {
            color: "text.primary",
            px: 1.5,
            py: 1,
          },
        },
        "& .MuiInputLabel-root": {
          transform: icon ? "translate(40px, 9px) scale(1)" : "translate(14px, 9px) scale(1)",
          "&.MuiInputLabel-shrink": {
            transform: "translate(14px, -8px) scale(0.75)",
            color: "primary.main",
            fontWeight: 500,
          },
        },
        "& input:-webkit-autofill": {
          WebkitBoxShadow: (theme: any) =>
            `0 0 0 100px ${theme.palette.background.paper} inset !important`,
          WebkitTextFillColor: (theme: any) =>
            `${theme.palette.text.primary} !important`,
          transition: "background-color 5000s ease-in-out 0s !important",
        },
        ...(sx || {}),
      }}
      variant={variant}
      slotProps={{
        input: {
          startAdornment: icon,
          endAdornment: endAdornment || (props as any).InputProps?.endAdornment,
          ...(props as any).InputProps
        },
      }}
      {...props}
    />
  );
}
