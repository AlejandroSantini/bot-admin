import React, { useState, useEffect } from "react";
import { useThemeMode } from "../../providers/ThemeModeProvider";
import {
  Box,
  Typography,
  Switch,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { 
  DarkMode as DarkModeIcon, 
} from "@mui/icons-material";
import { type ModulesConfig } from "../../services/settingsService";

interface SystemTabProps {
  initialModulesConfig?: ModulesConfig;
  showReservations?: boolean;
}

export default function SystemTab({ initialModulesConfig }: SystemTabProps) {
  const { mode, toggleColorMode } = useThemeMode();
  const [error, setError] = useState<string | null>(null);



  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Apariencia */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DarkModeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="600">Apariencia</Typography>
            </Box>
            <Box sx={{ 
              p: 1.5, bgcolor: 'action.hover', borderRadius: 2,
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
