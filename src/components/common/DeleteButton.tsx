import React from 'react';
import { IconButton, Tooltip, useTheme, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';

interface DeleteButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  variant?: 'delete' | 'cancel';
}

export default function DeleteButton({ onClick, disabled, loading, title, variant = 'delete' }: DeleteButtonProps) {
  const displayTitle = title || (variant === 'cancel' ? 'Cancelar' : 'Eliminar');
  const theme = useTheme();
  const size = '40px';
  const isDisabled = disabled || loading;

  return (
    <Tooltip title={loading ? (variant === 'cancel' ? 'Cancelando...' : 'Eliminando...') : displayTitle}>
      <IconButton
        onClick={onClick}
        disabled={isDisabled}
        sx={{
          width: size,
          height: size,
          minWidth: size,
          maxHeight: size,
          color: isDisabled ? theme.palette.grey[500] : theme.palette.error.main,
          transition: 'background-color 150ms, color 150ms',
          '&:hover': {
            bgcolor: isDisabled ? 'transparent' : 'rgba(211, 47, 47, 0.04)',
            color: isDisabled ? theme.palette.grey[500] : theme.palette.error.main,
          },
          '&.Mui-disabled': {
            pointerEvents: 'none',
            color: theme.palette.grey[500],
            bgcolor: 'transparent',
          },
        }}
      >
        {loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          variant === 'cancel' ? <CancelIcon /> : <DeleteIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}
