import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { createService, updateService, getService } from "../../services/serviceService";
import { BackButton } from "../../components/common/BackButton";

import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";

export default function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    code: "",
    description: "",
    price: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const fetchService = async () => {
        setLoading(true);
        try {
          const res = await getService(id);
          const data = res.data || res; 
          setForm({
            title: data.title || "",
            code: data.code || "",
            description: data.description || "",
            price: data.price ? Math.floor(parseFloat(data.price)).toString() : "",
            duration: data.duration?.toString() || "",
          });
        } catch (err) {
          console.error(err);
          alert("Error al cargar los detalles del servicio");
          navigate("/servicios");
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateService(id, form);
      } else {
        await createService(form);
      }
      navigate("/servicios");
    } catch (err) {
      alert("Error guardando servicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BackButton to="/servicios" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {isEdit ? "Editar" : "Nuevo"} Servicio
        </Typography>
      </Box>
      <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre / Título"
            value={form.title}
            variant="outlined"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <Input
            label="Código (ej: corte_hombre)"
            value={form.code}
            variant="outlined"
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <Input
            label="Descripción"
            multiline
            rows={3}
            variant="outlined"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Input
            label="Precio"
            type="number"
            variant="outlined"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Input
            label="Duración (minutos)"
            type="number"
            variant="outlined"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            sx={{ mb: 2 }}
          />

          <ContainedButton
            type="submit"
            loading={loading}
            fullWidth
          >
            Guardar
          </ContainedButton>
        </form>
      </CustomPaper>
    </Box>
  );
}
