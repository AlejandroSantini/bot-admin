import { useState, useRef, useEffect } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createCampaign, updateCampaign, getCampaignById } from "../../services/campaignService";
import { BackButton } from "../../components/common/BackButton";
import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import ImageUploader from "../../components/common/ImageUploader";

export default function CampaignForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  
  const isExecuteNowRef = useRef(false);

  useEffect(() => {
    if (isEditing && id) {
      const fetchCampaign = async () => {
        try {
          const res = await getCampaignById(id);
          const data = res.data || res;
          setNombre(data.nombre || "");
          setMensaje(data.mensaje || "");
          if (data.image_url) {
            setImages([data.image_url]);
          }
        } catch (err) {
          setError("Error al cargar la campaña para editar");
        } finally {
          setInitLoading(false);
        }
      };
      fetchCampaign();
    }
  }, [isEditing, id]);

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("mensaje", mensaje);
      formData.append("ejecutar_ahora", isExecuteNowRef.current ? "true" : "false");
      if (images.length > 0 && !images[0].startsWith("http")) {
        const file = dataURLtoFile(images[0], "campana_imagen.jpg");
        if (file) {
          formData.append("image", file);
        }
      }

      if (isEditing) {
        await updateCampaign(id!, formData);
        alert("Campaña actualizada correctamente");
      } else {
        await createCampaign(formData);
        alert("Campaña creada correctamente");
      }
      navigate("/campanas");
    } catch (err) {
      setError(isEditing ? "Error al actualizar la campaña" : "Error al crear la campaña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BackButton to="/campanas" state={location.state} />
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
          {isEditing ? "Editar Campaña" : "Nueva Campaña"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {initLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre"
            value={nombre}
            variant="outlined"
            onChange={(e) => setNombre(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Input
            label="Mensaje"
            value={mensaje}
            variant="outlined"
            onChange={(e) => setMensaje(e.target.value)}
            required
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Imagen (Opcional)
            </Typography>
            <ImageUploader
              value={images}
              onChange={setImages}
              multiple={false}
              placeholder="Subir Imagen de Campaña"
              emptyText="Haz clic aquí o arrastra una imagen para subir"
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}>
            <OutlinedButton
              variant="outlined"
              onClick={() => navigate("/campanas")}
              disabled={loading}
            >
              Cancelar
            </OutlinedButton>
            <ContainedButton
              type="submit"
              onClick={() => { isExecuteNowRef.current = false; }}
              loading={loading && !isExecuteNowRef.current}
              disabled={loading}
            >
              {isEditing ? "Guardar" : "Crear"}
            </ContainedButton>
            <ContainedButton
              type="submit"
              onClick={() => { isExecuteNowRef.current = true; }}
              loading={loading && isExecuteNowRef.current}
              disabled={loading}
            >
              {isEditing ? "Guardar y Enviar" : "Crear y Enviar"}
            </ContainedButton>
          </Box>
        </form>
      </CustomPaper>
      )}
    </Box>
  );
}
