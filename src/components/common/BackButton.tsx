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
      onClick={() => navigate(to, { state })}
      sx={{
        backgroundColor: "#f5f5f5",
        "&:hover": { backgroundColor: "#eeeeee" },
        mr: 1,
      }}
    >
      <ChevronLeftIcon />
    </IconButton>
  );
}
