import React from "react";
import { useThemeMode } from "../../providers/ThemeModeProvider";
import {
  Box,
  Typography,
  Switch,
  Card,
  CardContent,
} from "@mui/material";
import { 
  DarkMode as DarkModeIcon, 
} from "@mui/icons-material";


export default function SystemTab() {
  const { mode, toggleColorMode } = useThemeMode();

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Apariencia */}
        <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DarkModeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">Apariencia</Typography>
            </Box>
            <Box sx={{ 
              p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="body2" fontWeight="600">Modo Oscuro</Typography>
                <Typography variant="caption" color="text.secondary">Cambia el tema visual del sistema</Typography>
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
