import { TextField, InputAdornment, IconButton } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchInputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  onClear?: () => void;
  showClear?: boolean;
}

export function SearchInput({ onClear, showClear, InputProps, disabled, ...props }: SearchInputProps) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      disabled={disabled}
      {...props}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </InputAdornment>
        ),
        endAdornment: showClear && onClear ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  color: 'error.main',
                  bgcolor: 'rgba(211, 47, 47, 0.08)'
                } 
              }}
            >
              <CloseIcon sx={{ fontSize: '1.25rem' }} />
            </IconButton>
          </InputAdornment>
        ) : undefined,
        ...InputProps
      }}
      sx={{
        borderRadius: 1.5,
        mb: 2,
        mt: 0,
        '& .MuiInputBase-root': {
          borderRadius: 1.5,
          height: 40,
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
          cursor: disabled ? 'default' : 'pointer',
        },
        '& .MuiInputBase-input': {
          cursor: disabled ? 'default' : 'pointer',
        },
        ...props.sx,
      }}
    />
  );
}
 