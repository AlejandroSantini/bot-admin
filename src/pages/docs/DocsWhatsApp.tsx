import { Box, Typography, Card, CardContent, Divider, Breadcrumbs, Link, Alert } from "@mui/material";
import { InfoOutlined, WarningAmberOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ContainedButton } from "../../components/common/ContainedButton";

export default function DocsWhatsApp() {
  const navigate = useNavigate();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: "primary.main", mb: 3 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );

  const Step = ({ number, title, description }: { number: number; title: string; description: string }) => (
    <Box sx={{ mb: 4, pl: 4, position: "relative", borderLeft: "2px solid", borderColor: "primary.main" }}>
      <Box sx={{ 
        position: "absolute", 
        left: -15, 
        top: 0, 
        width: 28, 
        height: 28, 
        borderRadius: "50%", 
        bgcolor: "primary.main", 
        color: "white", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "0.8rem",
        boxShadow: "0 4px 10px rgba(59, 130, 246, 0.5)"
      }}>
        {number}
      </Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Paso {number}: {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
        {description}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, sm: 4 } }}>

      <Breadcrumbs sx={{ mb: 2, "& .MuiBreadcrumbs-li": { fontSize: "0.75rem" } }}>
        <Link underline="hover" color="inherit" href="/inicio">Dashboard</Link>
        <Link underline="hover" color="inherit" href="/configuracion">Configuración</Link>
        <Typography color="text.primary" sx={{ fontSize: "0.75rem" }}>Documentación WhatsApp</Typography>
      </Breadcrumbs>

      <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
        WhatsApp Business API
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 400 }}>
        Conecta, configura y activa tu canal de WhatsApp Business para gestionar conversaciones automatizadas.
      </Typography>
      <Alert severity="warning" icon={<WarningAmberOutlined />} sx={{ mb: 6, borderRadius: 1.5 }}>
        <strong>Importante:</strong> Se recomienda realizar toda la configuración desde una <strong>computadora</strong> para evitar errores de visualización en las ventanas emergentes de Meta.
      </Alert>

      <Section title="Requisitos Previos">
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          Antes de activar el canal de WhatsApp, asegúrate de tener:
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {[
            "Una cuenta activa en nuestro panel",
            "Un número de teléfono limpio (que no tenga WhatsApp activo)",
            "Una cuenta de Facebook Business Manager verificada",
            "Acceso administrativo al Portafolio de Negocios de Meta"
          ].map((req, i) => (
            <Card key={i} sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <CardContent sx={{ py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
                <Typography variant="body2" fontWeight={500}>{req}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Section>

      <Divider sx={{ mb: 6, opacity: 0.5 }} />

      <Section title="Guía de Configuración">
        <Step 
          number={1} 
          title="Preparar Meta Business Suite" 
          description="Inicia sesión en tu Facebook Business Manager y asegúrate de que tu negocio esté verificado. Si eres una agencia configurando para un cliente, asegúrate de usar la cuenta del cliente."
        />
        <Step 
          number={2} 
          title="Vincular con Kapso" 
          description="Desde la pestaña de Conexión Meta en tu panel, haz clic en 'Vincular WhatsApp'. Serás redirigido a una ventana segura de Meta para otorgar permisos."
        />
        <Step 
          number={3} 
          title="Seleccionar WABA" 
          description="Elige la cuenta de WhatsApp Business (WABA) que deseas usar o crea una nueva. Selecciona la categoría que mejor describa tu negocio."
        />
        <Step 
          number={4} 
          title="Verificación del Número" 
          description="Ingresa el número de teléfono y selecciona el método de verificación (SMS o Llamada). Recibirás un código de 6 dígitos que deberás ingresar para confirmar la propiedad del número."
        />
      </Section>

      <Alert 
        severity="info" 
        icon={<InfoOutlined />}
        sx={{ mb: 6, borderRadius: 1.5, bgcolor: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
      >
        <Typography variant="subtitle2" fontWeight={700}>Tip Pro:</Typography>
        <Typography variant="body2">
          Te recomendamos usar un número de teléfono nuevo. Si el número ya tiene WhatsApp, deberás eliminar la cuenta de WhatsApp desde la app del celular antes de intentar vincularlo a la API.
        </Typography>
      </Alert>

      <Section title="Mejores Prácticas">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <WarningAmberOutlined color="warning" />
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>Respeta la ventana de 24 horas</Typography>
              <Typography variant="body2" color="text.secondary">
                WhatsApp permite enviar mensajes libres solo dentro de las 24 horas desde el último mensaje del cliente. Fuera de ese plazo, deberás usar plantillas aprobadas.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <WarningAmberOutlined color="warning" />
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>Calidad del número</Typography>
              <Typography variant="body2" color="text.secondary">
                Si recibes muchos reportes de spam, WhatsApp bajará la calificación de tu número y podría suspender tu cuenta. Mantén tus mensajes relevantes.
              </Typography>
              </Box>
            </Box>
          </Box>
      </Section>

      <Divider sx={{ mb: 6, opacity: 0.5 }} />

      <Box sx={{ textAlign: "center", mb: 10 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ¿Listo para comenzar?
        </Typography>
        <ContainedButton size="large" onClick={() => navigate("/configuracion")}>
          Ir a Configurar Meta
        </ContainedButton>
      </Box>
    </Box>
  );
}
