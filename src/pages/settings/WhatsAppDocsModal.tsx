import { 
  Box, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Card, 
  CardContent, 
  Divider, 
  Alert,
  useTheme,
  useMediaQuery,
  Link
} from "@mui/material";
import { 
  Close as CloseIcon, 
  InfoOutlined, 
  WarningAmberOutlined,
  Business as BusinessIcon
} from "@mui/icons-material";

interface WhatsAppDocsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WhatsAppDocsModal({ open, onClose }: WhatsAppDocsModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "primary.main", mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );

  const Step = ({ number, title, description }: { number: number; title: string; description: string }) => (
    <Box sx={{ mb: 3, pl: 4, position: "relative", borderLeft: "2px solid", borderColor: "primary.main" }}>
      <Box sx={{ 
        position: "absolute", 
        left: -13, 
        top: 0, 
        width: 24, 
        height: 24, 
        borderRadius: "50%", 
        bgcolor: "primary.main", 
        color: "white", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "0.7rem",
        boxShadow: "0 4px 10px rgba(59, 130, 246, 0.4)"
      }}>
        {number}
      </Box>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Paso {number}: {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          backgroundImage: "none",
          borderRadius: isMobile ? 0 : 3,
          border: isMobile ? "none" : "1px solid",
          borderColor: "divider",
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={800}>WhatsApp Business API</Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ 
        borderColor: "divider", 
        p: { xs: 2, sm: 4 },
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "action.selected",
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "action.focus",
          },
        },
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Conecta, configura y activa tu canal de WhatsApp Business para gestionar conversaciones automatizadas.
        </Typography>

        <Alert severity="warning" icon={<WarningAmberOutlined />} sx={{ mb: 4, borderRadius: 2, "& .MuiAlert-message": { fontSize: "0.8rem" } }}>
          <strong>Importante:</strong> Se recomienda realizar toda la configuración desde una <strong>computadora</strong>.
        </Alert>

        <Section title="Requisitos Previos">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            {[
              "Cuenta activa en el panel",
              "Número limpio (sin WhatsApp)",
              "Meta Business verificado",
              "Acceso administrativo"
            ].map((req, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main" }} />
                <Typography variant="caption" fontWeight={600}>{req}</Typography>
              </Box>
            ))}
          </Box>
        </Section>

        <Divider sx={{ mb: 4 }} />

        <Section title="Guía de Configuración">
          <Step 
            number={1} 
            title="Meta Business Suite" 
            description="Inicia sesión en tu Facebook Business Manager y verifica que tu negocio esté validado por Meta."
          />
          <Step 
            number={2} 
            title="Vincular con Kapso" 
            description="Haz clic en 'Vincular WhatsApp' para otorgar permisos seguros a través de la ventana oficial de Meta."
          />
          <Step 
            number={3} 
            title="Configurar WABA" 
            description="Crea o selecciona tu cuenta de WhatsApp Business (WABA) y elige la categoría de tu negocio."
          />
          <Step 
            number={4} 
            title="Verificar Número" 
            description="Ingresa tu número y confirma la propiedad mediante el código de 6 dígitos enviado por SMS o llamada."
          />
        </Section>

        <Alert 
          severity="info" 
          icon={<InfoOutlined />}
          sx={{ mb: 4, borderRadius: 2, "& .MuiAlert-message": { fontSize: "0.8rem" } }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ display: "block" }}>Tip Pro:</Typography>
          <Typography variant="caption">
            Usa un número nuevo. Si ya tiene WhatsApp, elimínalo desde la app oficial antes de empezar.
          </Typography>
        </Alert>

        <Section title="Mejores Prácticas">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <WarningAmberOutlined color="warning" sx={{ fontSize: 20 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8rem" }}>Ventana de 24 horas</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Solo puedes enviar mensajes libres dentro de las 24h desde el último mensaje del cliente.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Section>
      </DialogContent>
    </Dialog>
  );
}
