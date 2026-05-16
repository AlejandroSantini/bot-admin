import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { History as HistoryIcon, Close as CloseIcon } from "@mui/icons-material";
import { ClientSearch } from "../../components/common/ClientSearch";
import { crearReserva, obtenerReserva, actualizarReserva } from "../../services/reservaService";
import { getClientes, getFichasCliente } from "../../services/clienteService";
import { getServices } from "../../services/serviceService";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { BackButton } from "../../components/common/BackButton";
import { FichaClienteModal } from "../../components/FichaClienteModal";

import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import { DateInput } from "../../components/common/DateInput";
import { ProductSelector } from "../../components/common/ProductSelector";

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
    producto: "",
    monto_pago: "",
    observaciones: "",
    items: [] as { id?: string | number; nombre: string; cantidad: number; precio: number }[],
  });
  const [loading, setLoading] = useState(false);
  const [fichaOpen, setFichaOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const { modulesConfig } = useAuth();
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "warning" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {

    
    const fetchServices = async () => {
      try {
        const res = await getServices();
        const list = Array.isArray(res) ? res : res.data || [];
        setAvailableServices(list);
      } catch (err) {
        console.error("Error fetching services", err);
      }
    };
    fetchServices();

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
              producto: data.producto || "",
              monto_pago: data.monto_pago || "",
              observaciones: data.observaciones || "",
              items: [],
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

  const recalculateTotal = (serviceTitle: string, items: typeof form.items) => {
    const service = availableServices.find(s => s.title === serviceTitle);
    const servicePrice = Number(service?.price || service?.precio || 0);
    const productsTotal = items.reduce((acc, curr) => acc + curr.precio, 0);
    return (servicePrice + productsTotal).toString();
  };

  const updateItemsAndTotals = (newItems: typeof form.items) => {
    const total = recalculateTotal(form.rubro, newItems);
    const joinedNames = newItems.map(i => `${i.nombre} (x${i.cantidad})`).join(", ");
    setForm((prev) => ({
      ...prev,
      items: newItems,
      monto_pago: total,
      producto: joinedNames
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form };
      delete payload.items;
      
      payload.productos = form.items
        .filter(i => i.id !== undefined)
        .map(i => ({ cantidad: i.cantidad, producto: i.id }));

      if (isView && id) {
        const res = await actualizarReserva(id, payload);
        if (res.notificacion_enviada === false) {
          setNotification({
            open: true,
            message: `Actualizado. ${res.notificacion_error || "No se pudo enviar notificación."}`,
            severity: "warning",
          });
        } else {
          alert("Reserva actualizada correctamente");
        }
      } else {
        const res = await crearReserva(payload);
        if (res.notificacion_enviada === false) {
          setNotification({
            open: true,
            message: `Creado. ${res.notificacion_error || "No se pudo enviar notificación por falta de interacción previa."}`,
            severity: "warning",
          });
          setTimeout(() => navigate("/reservas"), 3000);
        } else {
          alert("Reserva creada correctamente");
          navigate("/reservas");
        }
      }
    } catch (err) {
      alert(isView ? "Error actualizando reserva" : "Error creando reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BackButton to="/reservas" state={location.state} />
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
          {isView ? "Editar Reserva" : "Nueva Reserva"}
        </Typography>
        {isView && form.phone && modulesConfig?.clientes !== false && (
          <OutlinedButton
            startIcon={<HistoryIcon />}
            onClick={handleOpenFicha}
          >
            Ver Ficha
          </OutlinedButton>
        )}
      </Box>
      <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <ClientSearch 
            value={form.nombre}
            onTextChange={(val) => setForm(prev => ({ ...prev, nombre: val }))}
            onChange={(client) => {
              setForm(prev => ({
                ...prev,
                nombre: client.nombre_completo || "",
                phone: client.phone_number || client.wa_id || "",
                mail: client.email || client.mail || "",
              }));
            }}
            required
          />

          <Input
            label="Teléfono"
            value={form.phone}
            variant="outlined"
            onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
            required
            sx={{ mb: 2 }}
          />

          <Input
            label="Email (Opcional)"
            value={form.mail}
            variant="outlined"
            onChange={(e: any) => setForm({ ...form, mail: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Select
            label="Rubro / Servicio"
            value={form.rubro}
            onChange={(e: any) => {
              const newService = e.target.value;
              setForm(prev => ({ 
                ...prev, 
                rubro: newService,
                monto_pago: recalculateTotal(newService, prev.items)
              }));
            }}
            options={[
              { value: "", label: "Seleccionar servicio..." },
              ...availableServices.map((s: any) => ({
                value: s.title,
                label: s.title
              }))
            ]}
          />
          <DateInput
            label="Fecha"
            value={form.fecha}
            variant="outlined"
            onChange={(e: any) => setForm({ ...form, fecha: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <Input
            type="time"
            label="Horario"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={form.horario}
            onChange={(e: any) => setForm({ ...form, horario: e.target.value })}
            sx={{ mb: 2 }}
            required
          />

          <ProductSelector 
            items={form.items}
            onChange={updateItemsAndTotals}
          />

          <Input
            label="Monto Total Pago ($)"
            type="number"
            value={form.monto_pago}
            variant="outlined"
            onChange={(e: any) => setForm({ ...form, monto_pago: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Input
            label="Observaciones"
            multiline
            rows={3}
            value={form.observaciones}
            variant="outlined"
            onChange={(e: any) => setForm({ ...form, observaciones: e.target.value })}
            sx={{ mb: 3 }}
          />

          <ContainedButton
            type="submit"
            loading={loading}
            fullWidth
          >
            {isView ? "Guardar Cambios" : "Crear Reserva"}
          </ContainedButton>
        </form>
      </CustomPaper>

      <FichaClienteModal
        open={fichaOpen}
        onClose={() => setFichaOpen(false)}
        clientName={form.nombre}
        phone={form.phone}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
