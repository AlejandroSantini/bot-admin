import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { WhatsApp, CheckCircle, Warning, ErrorOutline, Description as DocIcon, Business as BusinessIcon, Info as InfoIcon, Computer as ComputerIcon } from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { settingsService } from "../../services/settingsService";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import WhatsAppDocsModal from "./WhatsAppDocsModal";

export default function MetaConnectionTab() {
  const [connecting, setConnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const { onboardingStep, setOnboardingStep, user } = useAuth();
  const [progress, setProgress] = useState(onboardingStep > 0 ? 100 : 0);

  const isConnected = onboardingStep >= 1 || !!user?.meta_phone_number_id;

  const handleConnect = async () => {
    // En producción, aquí se abriría el popup de Meta (FB.login)
    // Por ahora, simulamos el proceso de vinculación
    setConnecting(true);
    try {
      // Simulamos una demora de red
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // SOLO para propósitos de demostración en este ambiente:
      // await settingsService.updateMetaConfig("123456789012345");
      // await setOnboardingStep();
      
      alert("Simulación: En producción, aquí se abriría el Login de Meta y se recibiría el WABA ID real.");
    } catch (error) {
      console.error("Error al vincular Meta:", error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Simulado: enviamos null o vacio para desvincular
      await settingsService.updateMetaConfig(""); 
      await setOnboardingStep();
      setShowConfirm(false);
    } catch (error) {
      console.error("Error al desvincular Meta:", error);
    }
  };


  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          WhatsApp Business API
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conecta tu cuenta oficial para habilitar las respuestas automáticas.
        </Typography>
      </Box>

      <Card 
        sx={{ 
          borderRadius: 2, 
          backgroundColor: isConnected ? "rgba(74, 222, 128, 0.02)" : "transparent",
          border: isConnected ? "1px solid rgba(74, 222, 128, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)",
          mb: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: isConnected ? 0 : 3 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 1.5, 
              backgroundColor: isConnected ? "#4ade80" : "primary.main", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "white",
            }}>
              {isConnected ? <CheckCircle fontSize="small" /> : <WhatsApp fontSize="small" />}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {isConnected ? "API Conectada" : "Meta Business Suite"}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {isConnected ? "Sincronización activa con el número oficial." : "Vínculo seguro a través de Kapso."}
              </Typography>
            </Box>
            {isConnected && (
              <OutlinedButton 
                size="small" 
                color="error" 
                onClick={() => setShowConfirm(true)}
              >
                Desvincular
              </OutlinedButton>
            )}
          </Box>

          {!isConnected && (
            <Box>
               <Alert 
                severity="info" 
                icon={<InfoIcon fontSize="small" />} 
                sx={{ 
                  mb: 1.5, 
                  borderRadius: 2, 
                  "& .MuiAlert-message": { fontSize: "0.8rem" } 
                }}
              >
                Al iniciar el proceso, se abrirá una ventana segura de Meta para autorizar el vínculo de tu cuenta oficial.
              </Alert>

              <Box sx={{ 
                mb: 1.5, 
                display: "flex", 
                alignItems: "center", 
                gap: 1.5, 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: "rgba(255, 152, 0, 0.05)", 
                border: "1px solid rgba(255, 152, 0, 0.2)" 
              }}>
                <ComputerIcon sx={{ color: "#ff9800", fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: "#ff9800", fontWeight: 700, fontSize: "0.75rem" }}>
                  RECOMENDACIÓN: Realizar este proceso desde una COMPUTADORA.
                </Typography>
              </Box>

              <Box sx={{ mb: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box 
                  onClick={() => setShowDocs(true)}
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: "action.hover", 
                    border: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "action.selected", borderColor: "primary.main" }
                  }}
                >
                  <DocIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Guía de Configuración</Typography>
                    <Typography variant="caption" color="text.secondary">Aprende paso a paso cómo activar tus canales.</Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: "primary.main", mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                    Requisitos Previos
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BusinessIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                      Necesitas un{" "}
                      <Typography 
                        component="a" 
                        href="https://www.facebook.com/business/help/1710077379203657" 
                        target="_blank" 
                        rel="noopener"
                        sx={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: 'inherit', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      >
                        Portafolio de Negocios
                      </Typography>{" "}
                      activo y verificado en Meta.
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {connecting ? (
                <Box sx={{ width: '100%', py: 1 }}>
                  <Typography variant="caption" sx={{ mb: 1, display: "block", textAlign: "center" }}>
                    Sincronizando... {progress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }} />
                </Box>
              ) : (
                <ContainedButton 
                  fullWidth
                  onClick={handleConnect}
                  sx={{ 
                    py: 1, 
                    backgroundColor: "#25D366", 
                    "&:hover": { backgroundColor: "#1ea952" } 
                  }}
                >
                  Vincular WhatsApp
                </ContainedButton>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {isConnected && onboardingStep === 1 && (
        <Alert 
          severity="success" 
          sx={{ 
            borderRadius: 2, 
            backgroundColor: "rgba(74, 222, 128, 0.05)",
            border: "1px solid rgba(74, 222, 128, 0.1)",
            "& .MuiAlert-message": { fontSize: "0.8rem" }
          }}
        >
          <strong>¡Conexión exitosa!</strong> Ahora puedes configurar el flujo en la sección correspondiente.
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog 
        open={showConfirm} 
        onClose={() => setShowConfirm(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#1e293b",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            minWidth: 320
          }
        }}
      >
        <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ErrorOutline color="error" />
          <Typography variant="h6" fontWeight={700}>¿Estás seguro?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 2 }}>
            Al desvincular tu cuenta de WhatsApp, <strong>se borrará toda la configuración del bot, flujos y conocimientos</strong> cargados hasta el momento.
          </Typography>
          <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <OutlinedButton 
            onClick={() => setShowConfirm(false)}
            sx={{ color: "white", textTransform: "none" }}
          >
            Cancelar
          </OutlinedButton>
          <ContainedButton 
            onClick={handleDisconnect}
            sx={{ bgcolor: 'error.main', background: 'error.main', textTransform: "none", borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: 'error.dark' } }}
          >
            Sí, desvincular y borrar todo
          </ContainedButton>
        </DialogActions>
      </Dialog>

      <WhatsAppDocsModal 
        open={showDocs} 
        onClose={() => setShowDocs(false)} 
      />
    </Box>
  );
}
