import { useEffect, useState, useMemo } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { CustomPaper } from "../../components/common/CustomPaper";
import { Table } from "../../components/common/Table"; // Assuming this exists
import DeleteButton from "../../components/common/DeleteButton";
import { getClientes, deleteCliente } from "../../services/clienteService";

// Simple interface based on use case
interface Cliente {
  id: string | number;
  wa_id?: string;
  phone_number: string;
  profile_name?: string;
  nombre_completo?: string;
  origen_cliente?: string;
  tenant_id?: string;
  [key: string]: any;
}

export default function Clients() {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientes();
      // Adjust depending on if it returns array or { data: [] }
      const list = Array.isArray(data) ? data : data.data || [];
      setClients(list);
    } catch (err: any) {
      console.error(err);
      setError("Error cargando clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

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
    { label: "Tenant", render: (c: Cliente) => c.tenant_id || "-" },
    {
      label: "Acciones",
      render: (c: Cliente) => (
        <DeleteButton
          onClick={(e) => {
            e?.stopPropagation();
            handleDelete(c._id || c.id);
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mx: "auto", p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Clientes (Bot)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomPaper>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table
            columns={columns}
            data={clients}
            getRowKey={(c: any) => c._id || c.id}
            emptyMessage="No hay clientes registrados."
          />
        )}
      </CustomPaper>
    </Box>
  );
}
