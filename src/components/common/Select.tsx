import { FormControl, InputLabel, Select as MuiSelect, MenuItem, Typography } from '@mui/material';
import type { SelectProps } from '@mui/material';
import { useId } from 'react';
import type { ReactNode } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

export interface SelectPropsCustom extends Omit<SelectProps, 'children'> {
  label: string;
  options: SelectOption[];
  value: SelectProps['value'];
  onChange: SelectProps['onChange'];
  helperText?: string;
}

export function Select({ label, options, value, onChange, helperText, sx, ...props }: SelectPropsCustom) {
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const selectId = `${baseId}-control`;

  return (
    <FormControl
      fullWidth
      size="small"
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        mt: 1,
        mb: helperText ? 0.5 : 2,
        '& .MuiInputBase-root': {
          borderRadius: 1.5,
          height: 40,
          backgroundColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
          border: "1px solid",
          borderColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
          '&:hover': {
            borderColor: "primary.main",
            backgroundColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
          },
          '&.Mui-focused': {
            borderColor: "primary.main",
            boxShadow: (theme: any) => `0 0 0 3px ${theme.palette.primary.main}22`,
            backgroundColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
          },
          "& fieldset": {
            border: "none",
          },
        },
        "& .MuiInputLabel-root": {
          transform: "translate(14px, 9px) scale(1)",
          "&.MuiInputLabel-shrink": {
            transform: "translate(14px, -8px) scale(0.75)",
            color: "primary.main",
            fontWeight: 500,
          },
        },
        ...(sx || {}),
      }}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect
        id={selectId}
        labelId={labelId}
        label={label}
        value={value}
        onChange={onChange}
        size="small"
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.icon && <span style={{ marginRight: 8 }}>{option.icon}</span>}
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && (
        <Typography variant="caption" color={props.error ? "error" : "text.secondary"} sx={{ ml: 1, mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
}
