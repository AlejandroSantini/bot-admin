import React from "react";
import { useThemeMode } from "../../providers/ThemeModeProvider";
import {
  Box,
  Typography,
  Switch,
  Card,
  CardContent,
} from "@mui/material";
import { DarkMode as DarkModeIcon } from "@mui/icons-material";

interface SystemTabProps {
  initialReminders?: any;
  initialModulesConfig?: any;
  showReservations?: boolean;
}

export default function SystemTab({}: SystemTabProps) {
  const { mode, toggleColorMode } = useThemeMode();

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <DarkModeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">Apariencia</Typography>
            </Box>
            <Box sx={{ 
              flexGrow: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="body2" fontWeight="600">Modo Oscuro</Typography>
                <Typography variant="caption" color="text.secondary">Cambia el tema visual</Typography>
              </Box>
              <Switch 
                checked={mode === 'dark'} 
                onChange={toggleColorMode} 
                color="primary"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
