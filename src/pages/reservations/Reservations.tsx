import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
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
  obtenerReservasPorTelefono,
  eliminarReserva,
} from "../../services/reservaService";

// Example tenants
const TENANTS_OPTIONS = [
  { value: "nutricion", label: "nutricion" },
  { value: "default", label: "default" },
];

export default function Reservations() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState("nutricion");
  const [searchPhone, setSearchPhone] = useState("");

  const loadReservas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (searchPhone) {
        res = await obtenerReservasPorTelefono(searchPhone, tenantId);
      } else {
        res = await obtenerReservas(tenantId);
      }

      const list = Array.isArray(res) ? res : res.data || [];
      setReservas(list);
    } catch (err: any) {
      console.error(err);
      setError("Error cargando reservas");
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId, searchPhone]);

  useEffect(() => {
    loadReservas();
  }, [loadReservas]); // Reload when tenant changes

  // Trigger search manually or when phone is cleared
  const handleSearch = () => {
    loadReservas();
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("¿Cancelar/Eliminar reserva?")) return;
    try {
      await eliminarReserva(id);
      loadReservas();
    } catch (err) {
      alert("Error eliminando reserva");
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
      label: "Info Extra",
      render: (r: any) => `${r.dni ? "DNI:" + r.dni : ""} ${r.mail || ""}`,
    },
    {
      label: "Acciones",
      render: (r: any) => (
        <DeleteButton
          onClick={(e) => {
            e?.stopPropagation();
            handleDelete(r._id || r.id);
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
            if (
              window.confirm(
                `¿Ver detalles de ${r.nombre}? (Actualmente solo eliminar disponible)`
              )
            ) {
              // Could navigate or show modal. For now, reusing delete logic if confirmed again?
              // Just log for now or show alert
              // alert(JSON.stringify(r));
            }
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mx: "auto", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Reservas</Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Select
            label="Tenant"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value as string)}
            options={TENANTS_OPTIONS}
            sx={{ width: 150, mb: 0 }}
          />

          <Input
            label="Buscar por Teléfono"
            value={searchPhone}
            variant="outlined"
            onChange={(e) => setSearchPhone(e.target.value)}
            sx={{ mb: 0, width: 200 }}
            endAdornment={
              <InputAdornment position="end">
                <SearchIcon onClick={handleSearch} sx={{ cursor: "pointer" }} />
              </InputAdornment>
            }
          />
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

      <SimpleTabs tabs={tabs} />
    </Box>
  );
}
