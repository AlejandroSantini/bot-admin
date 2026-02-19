import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { CustomPaper } from "../../components/common/CustomPaper";
import { Table } from "../../components/common/Table";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";
import DeleteButton from "../../components/common/DeleteButton";
import { getServices, deleteService } from "../../services/serviceService";

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServices();
      // Adjust if wrapped
      setServices(Array.isArray(data) ? data : (data as any).data || []);
    } catch (err) {
      setError("Error cargando servicios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("¿Eliminar servicio?")) return;
    try {
      await deleteService(id);
      loadServices();
    } catch (err) {
      alert("Error eliminando servicio");
    }
  };

  const columns = [
    { label: "Nombre", render: (s: any) => s.name || s.title || "-" },
    { label: "Descripción", render: (s: any) => s.description || "-" },
    { label: "Precio", render: (s: any) => (s.price ? `$${s.price}` : "-") },
    {
      label: "Duración",
      render: (s: any) => (s.duration ? `${s.duration} min` : "-"),
    },
    {
      label: "Acciones",
      render: (s: any) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <DeleteButton
            onClick={(e) => {
              e?.stopPropagation();
              handleDelete(s._id || s.id);
            }}
          />
        </Box>
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
        <Typography variant="h5">Servicios</Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ContainedButton
            startIcon={<AddIcon />}
            onClick={() => navigate("/servicios/nuevo")}
          >
            Nuevo Servicio
          </ContainedButton>
        </Box>
      </Box>

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
            data={services}
            getRowKey={(s: any) => s._id || s.id}
            onRowClick={(s: any) => navigate(`/servicios/${s.id || s._id}`)}
            emptyMessage="No hay servicios para este tenant."
          />
        )}
      </CustomPaper>
    </Box>
  );
}
