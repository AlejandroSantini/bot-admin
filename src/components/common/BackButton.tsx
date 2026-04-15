import { IconButton } from "@mui/material";
import { ChevronLeft as ChevronLeftIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to: string;
  state?: any;
}

export function BackButton({ to, state }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <IconButton
      title="Volver"
      onClick={() => navigate(to, { state })}
      sx={{
        backgroundColor: "action.hover",
        "&:hover": { backgroundColor: "action.selected" },
        mr: 1,
      }}
    >
      <ChevronLeftIcon />
    </IconButton>
  );
}
