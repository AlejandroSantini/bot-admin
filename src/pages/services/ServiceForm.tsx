import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { createService, updateService } from "../../services/serviceService";

import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";

export default function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Logic to fetch service if needed would go here
  }, [id, isEdit]);

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
      <Typography variant="h5" mb={3}>
        {isEdit ? "Editar" : "Nuevo"} Servicio
      </Typography>
      <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre"
            value={form.name}
            variant="outlined"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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

          <ContainedButton type="submit" loading={loading} fullWidth>
            Guardar
          </ContainedButton>
        </form>
      </CustomPaper>
    </Box>
  );
}
