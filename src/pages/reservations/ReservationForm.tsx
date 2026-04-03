import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { History as HistoryIcon } from "@mui/icons-material";
import { crearReserva, obtenerReserva } from "../../services/reservaService";
import { getFichasCliente } from "../../services/clienteService";
import { BackButton } from "../../components/common/BackButton";
import { FichaClienteModal } from "../../components/FichaClienteModal";

import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import { DateInput } from "../../components/common/DateInput";

export default function ReservationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isView = Boolean(id);

  const [form, setForm] = useState({
    phone: "",
    rubro: "", // Service
    fecha: "",
    horario: "",
    nombre: "",
    mail: "",
  });
  const [loading, setLoading] = useState(false);
  const [fichaOpen, setFichaOpen] = useState(false);

  useEffect(() => {
    if (isView && id) {
      const fetchReserva = async () => {
        setLoading(true);
        try {
          const res = await obtenerReserva(id);
          const data = res.data; 
          
          if (data) {
            setForm({
              phone: data.phone || "",
              rubro: data.rubro || data.motivo || "",
              fecha: data.fecha || "",
              horario: data.horario || "",
              nombre: data.nombre || "",
              mail: data.mail || "",
            });
          }
        } catch (err) {
          console.error(err);
          alert("Error al cargar la reserva");
        } finally {
          setLoading(false);
        }
      };
      fetchReserva();
    }
  }, [id, isView]);

  const handleOpenFicha = async () => {
    if (!form.phone) return;
    setFichaOpen(true);
  };

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BackButton to="/reservas" state={location.state} />
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
          {isView ? "Detalle de Reserva" : "Nueva Reserva"}
        </Typography>
        {isView && form.phone && (
          <OutlinedButton
            startIcon={<HistoryIcon />}
            onClick={handleOpenFicha}
            sx={{ borderRadius: 50 }}
          >
            Ver Historial
          </OutlinedButton>
        )}
      </Box>
      <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Teléfono"
            value={form.phone}
            variant="outlined"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            sx={{ mb: 2 }}
            disabled={isView}
          />
          <Input
            label="Nombre Cliente"
            value={form.nombre}
            variant="outlined"
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            sx={{ mb: 2 }}
            disabled={isView}
          />
          <Input
            label="Rubro / Servicio"
            value={form.rubro}
            variant="outlined"
            onChange={(e) => setForm({ ...form, rubro: e.target.value })}
            sx={{ mb: 2 }}
            disabled={isView}
          />
          <DateInput
            label="Fecha"
            value={form.fecha}
            variant="outlined"
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            sx={{ mb: 2 }}
            required
            disabled={isView}
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
            disabled={isView}
          />

          {!isView && (
            <ContainedButton
              type="submit"
              loading={loading}
              fullWidth
              sx={{ borderRadius: 50, mt: 3 }}
            >
              Crear Reserva
            </ContainedButton>
          )}
        </form>
      </CustomPaper>

      <FichaClienteModal
        open={fichaOpen}
        onClose={() => setFichaOpen(false)}
        clientName={form.nombre}
        phone={form.phone}
      />
    </Box>
  );
}
