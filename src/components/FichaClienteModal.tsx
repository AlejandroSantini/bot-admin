import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Close as CloseIcon, History as HistoryIcon } from "@mui/icons-material";
import { Table } from "./common/Table";
import { Paginator } from "./common/Paginator";
import { getFichasCliente } from "../services/clienteService";

interface FichaClienteModalProps {
  open: boolean;
  onClose: () => void;
  clientName: string;
  phone: string;
}

export function FichaClienteModal({ open, onClose, clientName, phone }: FichaClienteModalProps) {
  const navigate = useNavigate();
  const [fichaData, setFichaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalVisitas, setTotalVisitas] = useState<string | number | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (open && phone) {
      const fetchFicha = async () => {
        setLoading(true);
        setPage(1);
        try {
          const res = await getFichasCliente({ phone });
          const allClientsData = Array.isArray(res.data) ? res.data : [];
          const clientFicha = allClientsData.find((c: any) => c.phone === phone) || allClientsData[0];
          
          setFichaData(clientFicha?.visitas || []);
          setTotalVisitas(clientFicha?.total_visitas || null);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(true);
          setLoading(false);
        }
      };
      fetchFicha();
    }
  }, [open, phone]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Ficha del Cliente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {clientName || phone}
            {totalVisitas && ` • ${totalVisitas} visita${Number(totalVisitas) !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <IconButton onClick={onClose} title="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table
              data={fichaData.slice((page - 1) * itemsPerPage, page * itemsPerPage)}
              getRowKey={(item: any) => item.id || Math.random()}
              onRowClick={(item: any) => {
                const reservationId = item.id || item._id;
                console.log("Visit selected:", { id: item.id, _id: item._id, result: reservationId });
                if (reservationId) {
                  navigate(`/reservas/${reservationId}`);
                  onClose();
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
