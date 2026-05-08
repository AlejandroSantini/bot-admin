import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Chip } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { createCliente, getClienteById, updateCliente, getFichasCliente } from "../../services/clienteService";
import { BackButton } from "../../components/common/BackButton";

import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import { Table } from "../../components/common/Table";
import { Paginator } from "../../components/common/Paginator";

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    phone_number: "",
    nombre_completo: "",
    origen_cliente: "manual_admin",
  });
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Ficha state
  const [fichaData, setFichaData] = useState<any[]>([]);
  const [loadingFicha, setLoadingFicha] = useState(false);
  const [totalVisitas, setTotalVisitas] = useState<string | number | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (id) {
      const loadCliente = async () => {
        try {
          const res = await getClienteById(id);
          const c = res.data || res;
          setForm({
            phone_number: c.phone_number || "",
            nombre_completo: c.nombre_completo || "",
            origen_cliente: c.origen_cliente || "manual_admin",
          });
          
          if (c.phone_number || c.wa_id) {
            loadFicha(c.phone_number || c.wa_id);
          }
        } catch (err) {
          alert("Error cargando el cliente");
        } finally {
          setInitLoading(false);
        }
      };

      const loadFicha = async (phone: string) => {
        setLoadingFicha(true);
        try {
          const res = await getFichasCliente({ phone });
          const allClientsData = Array.isArray(res.data) ? res.data : [];
          const clientFicha = allClientsData.find((c: any) => c.phone === phone) || allClientsData[0];
          
          setFichaData(clientFicha?.visitas || []);
          setTotalVisitas(clientFicha?.total_visitas || null);
        } catch (err) {
          console.error("Error cargando ficha:", err);
        } finally {
          setLoadingFicha(false);
        }
      };

      loadCliente();
    } else {
      navigate("/clientes");
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCliente(id!, form);
      navigate("/clientes");
    } catch (err) {
      alert("Error actualizando cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BackButton to="/clientes" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Editar Cliente
        </Typography>
      </Box>

      {initLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
      <>
      <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Teléfono"
            value={form.phone_number}
            variant="outlined"
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            sx={{ mb: 2 }}
            required
            helperText="Ej: 5493446532255"
          />
          <Input
            label="Nombre"
            value={form.nombre_completo}
            variant="outlined"
            onChange={(e) =>
              setForm({ ...form, nombre_completo: e.target.value })
            }
            sx={{ mb: 2 }}
            required
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
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Historial de Reservas {totalVisitas ? `(${totalVisitas})` : ""}
        </Typography>
        <CustomPaper sx={{ p: 0, overflow: 'hidden' }}>
          {loadingFicha ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Table
                data={fichaData.slice((page - 1) * itemsPerPage, page * itemsPerPage)}
                getRowKey={(item: any) => item.id || Math.random()}
                onRowClick={(item: any) => {
                  const reservationId = item.id || item._id;
                  if (reservationId) {
                    navigate(`/reservas/${reservationId}`);
                  }
                }}
                columns={[
                  { label: "Fecha", render: (item: any) => item.fecha },
                  { label: "Servicio", render: (item: any) => item.rubro || item.motivo || "-" },
                  { label: "Producto", render: (item: any) => item.producto || "-" },
                  { 
                    label: "Pago", 
                    render: (item: any) => item.monto_pago ? `$${Number(item.monto_pago).toLocaleString('es-AR')}` : "-" 
                  },
                  {
                    label: "Estado",
                    render: (item: any) => (
                      <Chip
                        label={item.estado?.toUpperCase() || "PENDIENTE"}
                        size="small"
                        color={
                          item.estado === "confirmado"
                            ? "success"
                            : item.estado === "cancelado"
                            ? "error"
                            : "warning"
                        }
                        sx={{ fontWeight: 600, fontSize: "0.65rem" }}
                      />
                    ),
                  },
                  { 
                    label: "Observaciones", 
                    render: (item: any) => item.observaciones || "-",
                    width: '20%'
                  }
                ]}
                emptyMessage="No hay registros previos para este cliente."
              />
              <Paginator
                page={page}
                totalPages={Math.ceil(fichaData.length / itemsPerPage)}
                totalItems={fichaData.length}
                onPageChange={(_, p) => setPage(p)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </CustomPaper>
      </Box>
      </>
      )}
    </Box>
  );
}
