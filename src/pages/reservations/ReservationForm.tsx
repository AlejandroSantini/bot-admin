import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { crearReserva } from "../../services/reservaService";

import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";
import { DateInput } from "../../components/common/DateInput";

export default function ReservationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: "",
    rubro: "", // Service
    fecha: "",
    horario: "",
    nombre: "",
    mail: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearReserva(form);
      navigate("/reservas");
    } catch (err) {
      alert("Error creando reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h5" mb={3}>
        Nueva Reserva
      </Typography>
      <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Teléfono"
            value={form.phone}
            variant="outlined"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <Input
            label="Nombre Cliente"
            value={form.nombre}
            variant="outlined"
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Input
            label="Rubro / Servicio"
            value={form.rubro}
            variant="outlined"
            onChange={(e) => setForm({ ...form, rubro: e.target.value })}
            sx={{ mb: 2 }}
          />
          <DateInput
            label="Fecha"
            value={form.fecha}
            variant="outlined"
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <Input
            type="time"
            label="Horario"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={form.horario}
            onChange={(e) => setForm({ ...form, horario: e.target.value })}
            sx={{ mb: 2 }}
            required
          />

          <ContainedButton type="submit" loading={loading} fullWidth>
            Crear Reserva
          </ContainedButton>
        </form>
      </CustomPaper>
    </Box>
  );
}
