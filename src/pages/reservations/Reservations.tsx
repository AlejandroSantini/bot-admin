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
} from "@mui/material"; // Keep basic layout/feedback
import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table } from "../../components/common/Table";
import { Select } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
import { ContainedButton } from "../../components/common/ContainedButton";
import DeleteButton from "../../components/common/DeleteButton";
import { SimpleTabs } from "../../components/common/SimpleTabs";
import ReservationsCalendar from "./components/ReservationsCalendar";

import {
  obtenerReservas,
  cancelarReserva,
} from "../../services/reservaService";

export default function Reservations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const loadReservas = async (searchStr?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await obtenerReservas({ search: searchStr });
      const list = Array.isArray(res) ? res : res.data || [];
      setReservas(list);
    } catch (err: any) {
      console.error(err);
      setError("Error cargando reservas");
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      loadReservas();
      return;
    }
    const timer = setTimeout(() => {
      loadReservas(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCancel = async (id: string | number) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?"))
      return;
    try {
      await cancelarReserva(id);
      loadReservas();
    } catch (err) {
      alert("Error al cancelar la reserva");
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
        <DeleteButton
          variant="cancel"
          onClick={(e) => {
            e?.stopPropagation();
            handleCancel(r._id || r.id);
          }}
        />
      ),
    },
  ];

  const content = loading ? (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <CircularProgress />
    </Box>
  ) : null;

  const tabs = [
    {
      label: "Lista",
      content: content || (
        <Table
          columns={columns}
          data={reservas}
          getRowKey={(r: any) => r._id || r.id}
          onRowClick={(r: any) =>
            navigate(`/reservas/${r._id || r.id}`, { state: { tab: 0 } })
          }
          emptyMessage="No hay reservas."
          // loading handled in parent
        />
      ),
    },
    {
      label: "Calendario",
      content: content || (
        <ReservationsCalendar
          reservas={reservas}
          onSelectEvent={(r) => {
            navigate(`/reservas/${r._id || r.id}`, { state: { tab: 1 } });
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Reservas
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ width: 350 }}>
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
    </Box>
  );
}
