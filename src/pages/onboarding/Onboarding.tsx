import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { settingsService } from "../../services/settingsService";
import { ContainedButton } from "../../components/common/ContainedButton";

const STEPS = ["Cargar Documento", "Revisar Información", "Generar Bot"];

export default function Onboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Structured Data State
  const [structuredData, setStructuredData] = useState<any>({
    nombre: "",
    servicios: [],
    ubicacion: "",
    horarios: "",
    faq: [],
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
          setActiveStep(2);
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

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await settingsService.approveOnboarding();
      setActiveStep(2);
      setSuccess("¡Bot generado con éxito!");
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
    <Box sx={{ mx: "auto", p: { xs: 2, sm: 4 }, maxWidth: 1000 }}>
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

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && activeStep === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 3, textAlign: "center" }}>
          <CardContent>
            <Box sx={{ mb: 4, textAlign: "left" }}>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>
                Formato recomendado para tu documento:
              </Typography>
              <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 1 }}>
                  Para que el sistema arme la lógica perfecta de tu bot, te sugerimos incluir:
                </Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>• <strong>Nombre comercial</strong> claro y visible.</Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>• <strong>Ubicación</strong> de la sucursal y <strong>Horarios</strong> de atención.</Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>• <strong>Servicios</strong> ofrecidos detallando nombre y precio.</Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 1 }}>• <strong>Preguntas Frecuentes</strong> con sus respectivas respuestas.</Typography>
                <Typography variant="caption" sx={{ display: "block", mt: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  <a href="/public_ejemplo_negocio.txt" download style={{ color: 'inherit', textDecoration: 'underline' }}>
                    📥 Descargar archivo de ejemplo (.txt)
                  </a>
                </Typography>
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
                <Tab label="FAQs" />
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
                    Los servicios guardados aquí se cargarán en tu cuenta y podrás modificarlos, agregar imágenes o eliminarlos más adelante desde el módulo de <strong>Servicios</strong>.
                  </Alert>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <Button startIcon={<AddIcon />} onClick={() => addArrayItem("servicios", { nombre: "", precio: "", descripcion: "" })}>
                      Agregar Servicio
                    </Button>
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
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <Button startIcon={<AddIcon />} onClick={() => addArrayItem("faq", { pregunta: "", respuesta: "" })}>
                      Agregar FAQ
                    </Button>
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
            </Box>

            <Box sx={{ p: 3, borderTop: 1, borderColor: "divider", display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setActiveStep(0)}>Atrás</Button>
              <Box>
                <Button onClick={handleSaveData} sx={{ mr: 2 }}>
                  Guardar Progreso
                </Button>
                <ContainedButton onClick={handleApprove}>
                  Generar Bot
                </ContainedButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {!loading && activeStep === 2 && (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 5, textAlign: "center" }}>
          <CardContent>
            <SuccessIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" fontWeight="700" sx={{ mb: 1 }}>
              ¡Bot Generado con Éxito!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Los datos han sido validados y el árbol de decisión está estructurado.
            </Typography>
            <Button variant="outlined" onClick={() => setActiveStep(0)}>
              Crear Nuevo Bot
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
