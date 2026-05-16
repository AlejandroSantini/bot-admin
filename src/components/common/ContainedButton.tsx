import { Button, CircularProgress, Box } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';

interface ContainedButtonProps extends ButtonProps {
  icon?: ReactNode;
  children: ReactNode;
  loading?: boolean;
}

export function ContainedButton({ icon, children, loading, disabled, ...props }: ContainedButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={!loading ? icon : undefined}
      disabled={disabled || loading}
      sx={{
        borderRadius: 1.5,
        fontWeight: 500,
        px: 3,
        py: 0.8,
        height: 40,
        textTransform: 'none',
        boxShadow: 'none !important',
        letterSpacing: 0,
        fontSize: '0.95rem',
        minWidth: loading ? 140 : undefined,
        '&:hover': {
          boxShadow: 'none !important',
        },
        ...props.sx,
      }}
      {...props}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          <span>Cargando...</span>
        </Box>
      ) : (
        children
      )}
    </Button>
  );
}
