import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Alert, CircularProgress, IconButton } from "@mui/material";
import { CustomPaper } from "../../components/common/CustomPaper";
import { Table } from "../../components/common/Table"; // Assuming this exists
import DeleteButton from "../../components/common/DeleteButton";
import { getClientes, deleteCliente, getFichasCliente, pauseCliente } from "../../services/clienteService";
import { Input } from "../../components/common/Input";
import { Paginator } from "../../components/common/Paginator";
import { History as HistoryIcon, PlayArrow as PlayIcon, Pause as PauseIcon, Search as SearchIcon } from "@mui/icons-material";
import { FichaClienteModal } from "../../components/FichaClienteModal";
import { InputAdornment } from "@mui/material";

// Simple interface based on use case
interface Cliente {
  id: string | number;
  wa_id?: string;
  phone_number: string;
  profile_name?: string;
  nombre_completo?: string;
  origen_cliente?: string;
  tenant_id?: string;
  bot_paused?: boolean;
  [key: string]: any;
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [fichaOpen, setFichaOpen] = useState(false);
  const [search, setSearch] = useState("");

  const loadClients = async (searchStr?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientes({ search: searchStr });
      const list = Array.isArray(data) ? data : (data as any).data || [];
      setClients(list);
    } catch (err: any) {
      console.error(err);
      setError("Error cargando clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      loadClients();
      return;
    }

    const timer = setTimeout(() => {
      loadClients(search);
    }, 400); 

    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("¿Seguro de eliminar este cliente?")) return;
    try {
      await deleteCliente(id);
      setClients((prev) => prev.filter((c) => c._id !== id && c.id !== id)); // Handle _id vs id
      loadClients(); // Reload to be sure
    } catch (err) {
      alert("Error eliminando");
    }
  };

  const handleOpenFicha = async (client: Cliente) => {
    setSelectedClient(client);
    setFichaOpen(true);
  };

  const handleTogglePause = async (id: string | number, currentPaused: boolean) => {
    try {
      await pauseCliente(id, !currentPaused);
      loadClients(search);
    } catch (err) {
      alert("Error al cambiar estado de pausa");
    }
  };

  const columns = [
    {
      label: "Teléfono",
      render: (c: Cliente) => c.phone_number || c.wa_id || "-",
    },
    {
      label: "Nombre",
      render: (c: Cliente) => c.nombre_completo || c.profile_name || "-",
    },
    { label: "Origen", render: (c: Cliente) => c.origen_cliente || "-" },
    {
      label: "Acciones",
      render: (c: Cliente) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            color={c.bot_paused ? "error" : "success"}
            title={c.bot_paused ? "Reanudar Bot (Click para activar)" : "Pausar Bot (Click para desactivar)"}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePause(c._id || c.id, !!c.bot_paused);
            }}
          >
            {c.bot_paused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            title="Ver Historial (Ficha)"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenFicha(c);
            }}
          >
            <HistoryIcon />
          </IconButton>
          <DeleteButton
            onClick={(e) => {
              e?.stopPropagation();
              handleDelete(c._id || c.id);
            }}
          />
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Clientes (Bot)
        </Typography>

        <Box sx={{ width: 350 }}>
          <Input
            label="Buscar por Nombre o Teléfono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 0 }}
            endAdornment={
              <InputAdornment position="end">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            }
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table
          columns={columns}
          data={clients}
          getRowKey={(c: any) => c._id || c.id}
          onRowClick={(c: Cliente) => navigate(`/clientes/${c._id || c.id}`)}
          emptyMessage="No hay clientes registrados."
        />
      )}

      <FichaClienteModal
        open={fichaOpen}
        onClose={() => setFichaOpen(false)}
        clientName={selectedClient?.nombre_completo || selectedClient?.profile_name || ''}
        phone={selectedClient?.phone_number || selectedClient?.wa_id || ''}
      />
    </Box>
  );
}
