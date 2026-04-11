import { useState, useEffect } from "react";
import { Box, Typography, Autocomplete, TextField, IconButton } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { History as HistoryIcon, Close as CloseIcon } from "@mui/icons-material";
import { crearReserva, obtenerReserva, actualizarReserva } from "../../services/reservaService";
import { getFichasCliente } from "../../services/clienteService";
import { getProducts } from "../../services/productoService";
import type { Product } from "../../services/productoService";
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
    producto: "",
    monto_pago: "",
    observaciones: "",
    items: [] as { producto: string; cantidad: number; precio: number }[],
  });
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [currentQty, setCurrentQty] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [fichaOpen, setFichaOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const res = await getProducts();
        const list = Array.isArray(res) ? res : res.data || [];
        setAvailableProducts(list);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchAvailableProducts();

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

  const addItem = () => {
    if (!currentProduct && !form.producto) return;

    const name = currentProduct ? currentProduct.nombre : form.producto;
    const price = currentProduct ? Number(currentProduct.precio) : 0;
    const qty = Number(currentQty) || 1;

    const newItem = { producto: name, cantidad: qty, precio: price * qty };
    const newItems = [...form.items, newItem];
    
    const total = newItems.reduce((acc: number, curr: any) => acc + curr.precio, 0);
    const joinedNames = newItems.map(i => `${i.producto} (x${i.cantidad})`).join(", ");

    setForm({
      ...form,
      items: newItems,
      monto_pago: total.toString(),
      producto: joinedNames
    });
    
    setCurrentProduct(null);
    setSearchInput("");
    setCurrentQty(1);
  };

  const removeItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    const total = newItems.reduce((acc: number, curr: any) => acc + curr.precio, 0);
    const joinedNames = newItems.map(i => `${i.producto} (x${i.cantidad})`).join(", ");
    
    setForm({
      ...form,
      items: newItems,
      monto_pago: total.toString(),
      producto: joinedNames
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      delete (payload as any).items;

      if (isView && id) {
        await actualizarReserva(id, payload);
        alert("Reserva actualizada correctamente");
      } else {
        await crearReserva(payload);
        navigate("/reservas");
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
        {isView && form.phone && (
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
          <Input
            label="Teléfono"
            value={form.phone}
            variant="outlined"
            onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <Input
            label="Nombre Cliente"
            value={form.nombre}
            variant="outlined"
            onChange={(e: any) => setForm({ ...form, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Input
            label="Rubro / Servicio"
            value={form.rubro}
            variant="outlined"
            onChange={(e: any) => setForm({ ...form, rubro: e.target.value })}
            sx={{ mb: 2 }}
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

          <Box sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Agregar Productos
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={availableProducts}
                getOptionLabel={(option) => {
                  if (typeof option === "string") return option;
                  return option.nombre || "";
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.codigo} • ${option.precio}
                      </Typography>
                    </Box>
                  </Box>
                )}
                value={currentProduct}
                onChange={(_event: any, newValue: any) => {
                  setCurrentProduct(newValue);
                }}
                inputValue={searchInput}
                onInputChange={(_event, newInputValue) => {
                  setSearchInput(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Buscar Producto" 
                    variant="outlined" 
                    size="small"
                    sx={{
                      "& .MuiInputBase-root": {
                        backgroundColor: "white",
                      }
                    }}
                  />
                )}
              />
              <TextField
                label="Cant."
                type="number"
                size="small"
                sx={{ 
                  width: 80,
                  "& .MuiInputBase-root": {
                    backgroundColor: "white",
                  }
                }}
                value={currentQty}
                onChange={(e) => setCurrentQty(Number(e.target.value))}
              />
              <ContainedButton 
                onClick={addItem} 
                sx={{ minWidth: 40, p: 1.1 }}
                disabled={!currentProduct && !searchInput}
              >
                +
              </ContainedButton>
            </Box>

            {form.items.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {form.items.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1,
                      mb: 1,
                      backgroundColor: "rgba(0,0,0,0.03)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {item.producto} x{item.cantidad} - <strong>${item.precio}</strong>
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

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
    </Box>
  );
}
