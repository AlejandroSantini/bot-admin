import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AccountTree as FlowIcon,
  AddCircleOutline as NewBotIcon,
} from "@mui/icons-material";
import { settingsService } from "../../services/settingsService";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import BotFlowPreview from "./BotFlowPreview";
import { useAuth } from "../../hooks/useAuth";

const STEPS = ["Cargar Documento", "Revisar Información", "Preview Flujo", "Generar Bot"];
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Onboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [botType, setBotType] = useState<string>("reservas");

  // Structured Data State
  const [structuredData, setStructuredData] = useState<any>({
    nombre: "",
    servicios: [],
    productos: [],
    ubicacion: "",
    horarios: "",
    faq: [],
    payment_config: {
      payment_enabled: false,
      deposit_amount: 0,
      alias: "",
      require_payment_for: "all",
      cancellation_hours: 0
    }
  });

  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchCurrentOnboardingData();
  }, []);

  const fetchCurrentOnboardingData = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getOnboardingData();
      if (res?.data && res.data.status !== "vacio") {
        setStructuredData(res.data.structured_data || {});
        if (res.data.status === "pendiente_aprobacion") {
          setActiveStep(1);
        } else if (res.data.status === "aprobado") {
          setActiveStep(3);
        }
      }
    } catch (err) {
      console.error("Error fetching onboarding data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.uploadOnboardingFile(file);
      if (res?.status) {
        setStructuredData(res.data.structured_data);
        setActiveStep(1);
        setSuccess("Documento procesado correctamente.");
      }
    } catch (err) {
      setError("Error al procesar el archivo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveData = async () => {
    setLoading(true);
    setError(null);
    try {
      await settingsService.updateOnboardingData(structuredData);
      setSuccess("Datos guardados temporalmente.");
    } catch (err) {
      setError("Error al guardar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const { setOnboardingStep } = useAuth();

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await settingsService.approveOnboarding();
      setActiveStep(3);
      setSuccess("¡Bot generado con éxito!");
      await setOnboardingStep(); // Refrescamos el estado desde el backend
    } catch (err) {
      setError("Error al generar el bot.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setStructuredData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, subfield: string, value: any) => {
    const updatedArray = [...structuredData[field]];
    updatedArray[index] = { ...updatedArray[index], [subfield]: value };
    handleFieldChange(field, updatedArray);
  };

  const addArrayItem = (field: string, defaultObj: any) => {
    handleFieldChange(field, [...structuredData[field], defaultObj]);
  };

  const removeArrayItem = (field: string, index: number) => {
    const updatedArray = structuredData[field].filter((_: any, i: number) => i !== index);
    handleFieldChange(field, updatedArray);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: "auto", width: '100%', boxSizing: 'border-box' }}>

      {/* Stepper and title only show during wizard (steps 0-2) or when creating a new bot */}
      {activeStep < 3 && (
        <>
          {loading ? (
            <Box sx={{ mb: 5 }}>
              <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 4 }}>
                Flujo del Bot
              </Typography>
              <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </>
          )}
        </>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {loading && (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1.5 }} />
          </Box>
        </Card>
      )}

      {!loading && activeStep === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 3, textAlign: "center" }}>
          <CardContent>
            <Box sx={{ mb: 4, textAlign: "left" }}>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>
                Seleccioná el tipo de bot que necesitás:
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <Select
                  value={botType}
                  onChange={(e) => setBotType(e.target.value)}
                >
                  <MenuItem value="reservas">📅 Agendamiento y Reservas (Barberías, Consultorios)</MenuItem>
                  <MenuItem value="ecommerce">🛒 Ventas y E-Commerce (Tiendas, Restaurantes)</MenuItem>
                  <MenuItem value="atencion">💬 Atención al Cliente (Consultas generales)</MenuItem>
                  <MenuItem value="leads">🎯 Captación de Leads (Inmobiliarias, Agencias)</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>
                Formato recomendado para tu documento:
              </Typography>
              <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 1 }}>
                  Para que el sistema arme la lógica perfecta de tu bot, te sugerimos incluir:
                </Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>• <strong>Información básica</strong> (Nombre, ubicación, horarios).</Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>• <strong>Reglas del negocio</strong> o políticas importantes.</Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>• <strong>El Flujo deseado</strong> (Explicá cómo te gustaría que responda el bot).</Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 1 }}>• <strong>Preguntas Frecuentes</strong> con sus respectivas respuestas.</Typography>
                <Box sx={{ mt: 3, mb: 1, textAlign: "center" }}>
                  <a
                    href={`/public_ejemplo_${botType}.txt`}
                    download
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 0",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textAlign: "center",
                      borderRadius: 8,
                      textDecoration: "none",
                      color: "white",
                      background: "linear-gradient(90deg, #0072ff 0%, #00c6ff 100%)",
                      boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    📥 Descargar Plantilla de Ejemplo (.txt)
                  </a>
                </Box>

              </Box>
            </Box>

            <Box
              sx={{
                border: "2px dashed",
                borderColor: "primary.main",
                borderRadius: 3,
                p: 5,
                bgcolor: "action.hover",
                cursor: "pointer",
                transition: "0.3s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": { bgcolor: "action.selected" },
              }}
              component="label"
            >
              <input type="file" hidden accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
              <UploadIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" fontWeight="600">
                {file ? file.name : "Subí tu archivo de negocio"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formatos permitidos: PDF, DOCX, TXT.
              </Typography>
            </Box>


            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <ContainedButton onClick={handleUpload} disabled={!file}>
                Continuar
              </ContainedButton>
            </Box>
          </CardContent>
        </Card>
      )}


      {!loading && activeStep === 1 && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} variant="scrollable">
                <Tab label="General" />
                <Tab label="Servicios" />
                <Tab label="Productos" />
                <Tab label="FAQs" />
                <Tab label="Horarios" />
                <Tab label="Cobros y Señas" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Nombre del Negocio"
                      fullWidth
                      value={structuredData.nombre || ""}
                      onChange={(e) => handleFieldChange("nombre", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Ubicación"
                      fullWidth
                      value={structuredData.ubicacion || ""}
                      onChange={(e) => handleFieldChange("ubicacion", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Horarios"
                      fullWidth
                      value={structuredData.horarios || ""}
                      onChange={(e) => handleFieldChange("horarios", e.target.value)}
                    />
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Los servicios guardados aquí se cargarán en tu cuenta y podrás modificarlos o eliminarlos más adelante desde el módulo de <strong>Servicios</strong>.
                  </Alert>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <OutlinedButton startIcon={<AddIcon />} onClick={() => addArrayItem("servicios", { nombre: "", precio: "", descripcion: "" })}>
                      Agregar Servicio
                    </OutlinedButton>
                  </Box>
                  {structuredData.servicios?.map((serv: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Nombre"
                            fullWidth
                            value={serv.nombre || ""}
                            onChange={(e) => handleArrayChange("servicios", index, "nombre", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <TextField
                            label="Precio"
                            fullWidth
                            value={serv.precio || ""}
                            onChange={(e) => handleArrayChange("servicios", index, "precio", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Descripción"
                            fullWidth
                            value={serv.descripcion || ""}
                            onChange={(e) => handleArrayChange("servicios", index, "descripcion", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                          <IconButton color="error" onClick={() => removeArrayItem("servicios", index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Los productos guardados aquí se cargarán en el flujo del bot para que tus clientes puedan verlos y comprarlos.
                  </Alert>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <OutlinedButton startIcon={<AddIcon />} onClick={() => addArrayItem("productos", { nombre: "", precio: "", descripcion: "" })}>
                      Agregar Producto
                    </OutlinedButton>
                  </Box>
                  {structuredData.productos?.map((prod: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Nombre"
                            fullWidth
                            value={prod.nombre || ""}
                            onChange={(e) => handleArrayChange("productos", index, "nombre", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <TextField
                            label="Precio"
                            fullWidth
                            value={prod.precio || ""}
                            onChange={(e) => handleArrayChange("productos", index, "precio", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Descripción"
                            fullWidth
                            value={prod.descripcion || ""}
                            onChange={(e) => handleArrayChange("productos", index, "descripcion", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                          <IconButton color="error" onClick={() => removeArrayItem("productos", index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}

              {tabValue === 3 && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <OutlinedButton startIcon={<AddIcon />} onClick={() => addArrayItem("faq", { pregunta: "", respuesta: "" })}>
                      Agregar FAQ
                    </OutlinedButton>
                  </Box>
                  {structuredData.faq?.map((faq: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <Grid container spacing={2} alignItems="flex-start">
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <TextField
                            label="Pregunta"
                            fullWidth
                            multiline
                            rows={2}
                            value={faq.pregunta || ""}
                            onChange={(e) => handleArrayChange("faq", index, "pregunta", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Respuesta"
                            fullWidth
                            multiline
                            rows={2}
                            value={faq.respuesta || ""}
                            onChange={(e) => handleArrayChange("faq", index, "respuesta", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                          <IconButton color="error" onClick={() => removeArrayItem("faq", index)} sx={{ mt: 1 }}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}

              {tabValue === 4 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Estos rangos de horarios se cargarán en la configuración automática del negocio. Podrás modificarlos más adelante desde la sección <strong>Configuración</strong>.
                  </Alert>
                  {structuredData.schedule_config ? (
                    Object.keys(structuredData.schedule_config).map((dayIndex) => {
                      const config = structuredData.schedule_config[dayIndex];
                      if (!config.enabled || !config.ranges || config.ranges.length === 0) return null;
                      return (
                        <Box key={dayIndex} sx={{ mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "primary.main" }}>
                            {DAYS[parseInt(dayIndex)] || `Día ${dayIndex}`}
                          </Typography>
                          {config.ranges.map((r: any, i: number) => (
                            <Typography key={i} variant="body2" sx={{ ml: 2, mt: 1 }}>
                              🕒 <strong>{r.start}</strong> hasta <strong>{r.end}</strong> (Turnos cada {config.interval || 60} min)
                            </Typography>
                          ))}
                        </Box>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary">No se detectaron rangos de horarios precisos en el documento. Podrás configurarlos manualmente después.</Typography>
                  )}
                </Box>
              )}

              {tabValue === 5 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Configuración de pagos, señas y políticas de cancelación extraída del documento. Podrás modificarlos más adelante desde la sección <strong>Configuración</strong>.
                  </Alert>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Activar cobro de señas</InputLabel>
                        <Select
                          value={structuredData.payment_config?.payment_enabled ? "true" : "false"}
                          onChange={(e) => setStructuredData({
                            ...structuredData,
                            payment_config: { ...structuredData.payment_config, payment_enabled: e.target.value === "true" }
                          })}
                          label="Activar cobro de señas"
                        >
                          <MenuItem value="true">Sí (Activado)</MenuItem>
                          <MenuItem value="false">No (Desactivado)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Alias de Mercado Pago"
                        fullWidth
                        value={structuredData.payment_config?.alias || ""}
                        onChange={(e) => setStructuredData({
                          ...structuredData,
                          payment_config: { ...structuredData.payment_config, alias: e.target.value }
                        })}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Monto de Seña ($)"
                        fullWidth
                        type="number"
                        value={structuredData.payment_config?.deposit_amount || 0}
                        onChange={(e) => setStructuredData({
                          ...structuredData,
                          payment_config: { ...structuredData.payment_config, deposit_amount: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Horas de anticipación (Cancelación)"
                        fullWidth
                        type="number"
                        value={structuredData.payment_config?.cancellation_hours || 0}
                        onChange={(e) => setStructuredData({
                          ...structuredData,
                          payment_config: { ...structuredData.payment_config, cancellation_hours: parseInt(e.target.value, 10) || 0 }
                        })}
                        helperText="Horas antes para cancelar sin perder seña"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>Requerir pago para</InputLabel>
                        <Select
                          value={structuredData.payment_config?.require_payment_for || "all"}
                          onChange={(e) => setStructuredData({
                            ...structuredData,
                            payment_config: { ...structuredData.payment_config, require_payment_for: e.target.value }
                          })}
                          label="Requerir pago para"
                        >
                          <MenuItem value="all">Todos los clientes</MenuItem>
                          <MenuItem value="new">Solo clientes nuevos</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>

            <Box sx={{ p: 3, borderTop: 1, borderColor: "divider", display: "flex", justifyContent: "space-between" }}>
              <OutlinedButton onClick={() => setActiveStep(0)}>Atrás</OutlinedButton>
              <Box>
                <OutlinedButton onClick={handleSaveData} sx={{ mr: 2 }}>
                  Guardar Progreso
                </OutlinedButton>
                <ContainedButton onClick={() => setActiveStep(2)}>
                  Ver Flujo
                </ContainedButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {!loading && activeStep === 2 && (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Este es un preview interactivo de cómo quedará estructurado el flujo de tu bot. Podés editar los nombres haciendo click en las hojas. El bot podrá ser modificado posteriormente en la sección de configuración.
          </Alert>
          <BotFlowPreview 
            botType={botType}
            structuredData={structuredData} 
            setStructuredData={setStructuredData} 
            onNext={handleApprove} 
            onBack={() => setActiveStep(1)} 
          />
        </Card>
      )}

      {!loading && activeStep === 3 && (
        <Box>
          {/* Header bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Flujo del Bot</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
                Gestioná el comportamiento y las respuestas de tu asistente.
              </Typography>
            </Box>
            <OutlinedButton
              startIcon={<NewBotIcon />}
              onClick={() => setActiveStep(0)}
              size="small"
              sx={{ fontWeight: 600 }}
            >
              Nuevo Bot
            </OutlinedButton>
          </Box>

          {/* Flow editor as the main view */}
          <BotFlowPreview
            botType={botType}
            structuredData={structuredData}
            setStructuredData={setStructuredData}
            onNext={handleApprove}
            onBack={() => setActiveStep(1)}
            viewMode={true}
          />
        </Box>
      )}
    </Box>
  );
}
