import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, Check as CheckIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table } from "../../components/common/Table";
import { Select } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import DeleteButton from "../../components/common/DeleteButton";
import { SimpleTabs } from "../../components/common/SimpleTabs";
import ReservationsCalendar from "./components/ReservationsCalendar";

import {
  obtenerReservas,
  cancelarReserva,
  actualizarReserva,
  syncCalendar,
} from "../../services/reservaService";
import { settingsService } from "../../services/settingsService";
import { Paginator } from "../../components/common/Paginator";

export default function Reservations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reservas, setReservas] = useState<any[]>([]);
  const [allReservas, setAllReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await settingsService.getConfig();
        const config = data?.data || data?.config || data;

        if (config?.calendar_sync_enabled) {
          setCalendarSyncEnabled(true);
        }
      } catch (err) {
        console.error("Error fetching config in Reservations", err);
      }
    };
    fetchConfig();
  }, []);

  const handleSyncCalendar = async () => {
    try {
      setSyncing(true);
      await syncCalendar();
      alert("Sincronización completada con éxito");
    } catch (err) {
      alert("Error al sincronizar con Google Calendar");
    } finally {
      setSyncing(false);
    }
  };

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadAllReservas = async () => {
    try {
      const res = await obtenerReservas({ page: 1, limit: 999999, estado: 'confirmado' });
      const list = Array.isArray(res) ? res : res.data || [];
      setAllReservas(list);
    } catch (err) {
      console.error("Error loading all reservations for calendar", err);
    }
  };

  const loadReservas = async (searchStr?: string, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await obtenerReservas({ search: searchStr, page: pageNum, limit: 10 });
      const list = Array.isArray(res) ? res : res.data || [];
      setReservas(list);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.total);
      } else {
        setTotalPages(1);
        setTotalItems(list.length);
      }
    } catch (err: any) {
      console.error(err);
      setError("Error cargando reservas");
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReservas();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!search && search !== undefined) {
      loadReservas(undefined, page);
      return;
    }
    const timer = setTimeout(() => {
      loadReservas(search, page);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleCancel = async (id: string | number) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?"))
      return;
    try {
      await cancelarReserva(id);
      loadReservas(search, page);
      loadAllReservas();
    } catch (err) {
      alert("Error al cancelar la reserva");
    }
  };

  const handleConfirm = async (id: string | number) => {
    try {
      await actualizarReserva(id, { estado: "confirmado" });
      loadReservas(search, page);
      loadAllReservas();
    } catch (err) {
      alert("Error al confirmar la reserva");
    }
  };

  const columns = [
    { label: "Fecha", render: (r: any) => r.fecha || "-" },
    { label: "Horario", render: (r: any) => r.horario || "-" },
    { label: "Cliente", render: (r: any) => r.nombre || r.phone || "-" },
    { label: "Teléfono", render: (r: any) => r.phone || "-" },
    {
      label: "Motivo/Servicio",
      render: (r: any) => r.rubro || r.motivo || "-",
    },
    {
      label: "Estado",
      render: (r: any) => (
        <Chip
          label={r.estado?.toUpperCase() || "PENDIENTE"}
          size="small"
          color={
            r.estado === "confirmado"
              ? "success"
              : r.estado === "cancelado"
              ? "error"
              : "warning"
          }
          sx={{ fontWeight: 600, fontSize: "0.65rem" }}
        />
      ),
    },
    {
      label: "Acciones",
      render: (r: any) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {r.estado === "pendiente" && (
            <IconButton
              size="small"
              color="success"
              title="Confirmar Reserva"
              onClick={(e) => {
                e?.stopPropagation();
                handleConfirm(r._id || r.id);
              }}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          )}
          <DeleteButton
            variant="cancel"
            onClick={(e) => {
              e?.stopPropagation();
              handleCancel(r._id || r.id);
            }}
          />
        </Box>
      ),
    },
  ];

  const content = loading ? (
    <Box sx={{ p: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.02)' }} />
      ))}
    </Box>
  ) : null;

  const tabs = [
    {
      label: "Lista",
      content: content || (
        <>
          <Table
            columns={columns}
            data={reservas}
            getRowKey={(r: any) => r._id || r.id}
            onRowClick={(r: any) =>
              navigate(`/reservas/${r._id || r.id}`, { state: { tab: 0 } })
            }
            emptyMessage="No hay reservas."
            pagination={
              <Paginator
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={(_, newPage) => setPage(newPage)}
              />
            }
          />
        </>
      ),
    },
    {
      label: "Calendario",
      content: content || (
        <ReservationsCalendar
          reservas={allReservas}
          onSelectEvent={(r) => {
            setSelectedReserva(r);
            setOpenDialog(true);
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: "auto", width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Reservas
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { xs: "stretch", sm: "center" } }}>
          <Box sx={{ width: { xs: "100%", sm: 350 } }}>
            <Input
              label="Buscar por Nombre o Teléfono"
              value={search}
              variant="outlined"
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 0 }}
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              }
            />
          </Box>
          {calendarSyncEnabled && (
            <ContainedButton
              onClick={handleSyncCalendar}
              disabled={syncing}
              sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
            >
              {syncing ? <CircularProgress size={20} color="inherit" /> : "🔄 Sincronizar desde Google Calendar"}
            </ContainedButton>
          )}
          <ContainedButton
            startIcon={<AddIcon />}
            onClick={() => navigate("/reservas/nueva")}
          >
            Nueva
          </ContainedButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <SimpleTabs
        tabs={tabs}
        defaultTab={location.state?.tab !== undefined ? location.state.tab : 0}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Detalles de la Reserva</DialogTitle>
        <DialogContent dividers>
          {selectedReserva && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2"><strong>Cliente:</strong> {selectedReserva.nombre || selectedReserva.phone || "-"}</Typography>
              <Typography variant="body2"><strong>Teléfono:</strong> {selectedReserva.phone || "-"}</Typography>
              <Typography variant="body2"><strong>Fecha:</strong> {selectedReserva.fecha || "-"}</Typography>
              <Typography variant="body2"><strong>Horario:</strong> {selectedReserva.horario || "-"}</Typography>
              <Typography variant="body2"><strong>Servicio:</strong> {selectedReserva.rubro || selectedReserva.motivo || "-"}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2"><strong>Estado:</strong></Typography>
                <Chip
                  label={selectedReserva.estado?.toUpperCase() || "PENDIENTE"}
                  size="small"
                  color={
                    selectedReserva.estado === "confirmado"
                      ? "success"
                      : selectedReserva.estado === "cancelado"
                      ? "error"
                      : "warning"
                  }
                  sx={{ fontWeight: 600, fontSize: "0.65rem" }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <OutlinedButton onClick={() => setOpenDialog(false)} sx={{ height: 34, fontSize: '0.82rem' }}>
            Cerrar
          </OutlinedButton>
          <OutlinedButton
            onClick={() => {
              setOpenDialog(false);
              navigate(`/reservas/${selectedReserva._id || selectedReserva.id}`, { state: { tab: 1 } });
            }}
            sx={{ height: 34, fontSize: '0.82rem' }}
          >
            Ver Detalles
          </OutlinedButton>
          {selectedReserva && selectedReserva.estado === "pendiente" && (
            <ContainedButton
              onClick={() => {
                handleConfirm(selectedReserva._id || selectedReserva.id);
                setOpenDialog(false);
              }}
              sx={{ height: 34, fontSize: '0.82rem', background: 'success.main', bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
            >
              Confirmar
            </ContainedButton>
          )}
          {selectedReserva && selectedReserva.estado !== "cancelado" && (
            <ContainedButton
              onClick={() => {
                handleCancel(selectedReserva._id || selectedReserva.id);
                setOpenDialog(false);
              }}
              sx={{ height: 34, fontSize: '0.82rem', bgcolor: 'error.main', background: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
            >
              Eliminar
            </ContainedButton>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
