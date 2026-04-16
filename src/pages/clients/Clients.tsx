import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Table } from "../../components/common/Table";
import DeleteButton from "../../components/common/DeleteButton";
import {
  getClientes,
  deleteCliente,
  getFichasCliente,
  pauseCliente,
  blockCliente,
} from "../../services/clienteService";
import { Input } from "../../components/common/Input";
import { Paginator } from "../../components/common/Paginator";
import {
  History as HistoryIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Search as SearchIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { FichaClienteModal } from "../../components/FichaClienteModal";
import { InputAdornment } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface Cliente {
  id: string | number;
  wa_id?: string;
  phone_number: string;
  profile_name?: string;
  nombre_completo?: string;
  origen_cliente?: string;
  tenant_id?: string;
  bot_paused?: boolean;
  blocked?: boolean;
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { modulesConfig } = useAuth();

  const loadClients = async (searchStr?: string, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientes({
        search: searchStr,
        page: pageNum,
        limit: 10,
      });
      const list = Array.isArray(data) ? data : (data as any).data || [];
      setClients(list);

      const pData = data as any;
      if (pData.pagination) {
        setTotalPages(pData.pagination.totalPages);
        setTotalItems(pData.pagination.total);
      } else {
        setTotalPages(1);
        setTotalItems(list.length);
      }
    } catch (err: any) {
      console.error(err);
      setError("Error cargando clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!search && search !== undefined) {
      loadClients(undefined, page);
      return;
    }

    const timer = setTimeout(() => {
      loadClients(search, page);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, page]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("¿Seguro de eliminar este cliente?")) return;
    try {
      await deleteCliente(id);
      setClients((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      loadClients();
    } catch (err) {
      alert("Error eliminando");
    }
  };

  const handleOpenFicha = async (client: Cliente) => {
    setSelectedClient(client);
    setFichaOpen(true);
  };

  const handleTogglePause = async (
    id: string | number,
    currentPaused: boolean,
  ) => {
    try {
      await pauseCliente(id, !currentPaused);
      loadClients(search);
    } catch (err) {
      alert("Error al cambiar estado de pausa");
    }
  };

  const handleToggleBlock = async (
    id: string | number,
    currentBlocked: boolean,
  ) => {
    try {
      await blockCliente(id, !currentBlocked);
      loadClients(search);
    } catch (err) {
      alert("Error al cambiar estado de bloqueo");
    }
  };

  const columns = [
    {
      label: "Teléfono",
      render: (c: Cliente) => c.phone_number || c.wa_id || "-",
    },
    {
      label: "Nombre",
      render: (c: Cliente) => c.nombre_completo || "-",
    },
    {
      label: "Origen",
      render: (c: Cliente) => (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color:
              c.origen_cliente === "manual_admin"
                ? "primary.main"
                : "text.secondary",
            textTransform: "uppercase",
            fontSize: "0.7rem",
          }}
        >
          {c.origen_cliente === "manual_admin" ? "Editado" : "WhatsApp"}
        </Typography>
      ),
    },
    {
      label: "Acciones",
      render: (c: Cliente) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            color={c.bot_paused ? "error" : "success"}
            title={
              c.bot_paused
                ? "Reanudar Bot (Click para activar)"
                : "Pausar Bot (Click para desactivar)"
            }
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePause(c._id || c.id, !!c.bot_paused);
            }}
          >
            {c.bot_paused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
          {modulesConfig?.reservas !== false && (
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
          )}
          <IconButton
            size="small"
            color={c.blocked ? "error" : "default"}
            title={c.blocked ? "Desbloquear Cliente" : "Bloquear Cliente"}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBlock(c._id || c.id, !!c.blocked);
            }}
          >
            <BlockIcon />
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
    <Box
      sx={{
        mx: "auto",
        p: { xs: 1, sm: 2 },
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Clientes (Bot)
        </Typography>

        <Box sx={{ width: { xs: "100%", sm: 350 } }}>
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
          pagination={
            <Paginator
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(_, newPage) => setPage(newPage)}
            />
          }
        />
      )}

      <FichaClienteModal
        open={fichaOpen}
        onClose={() => setFichaOpen(false)}
        clientName={selectedClient?.nombre_completo || ""}
        phone={selectedClient?.phone_number || selectedClient?.wa_id || ""}
      />
    </Box>
  );
}
