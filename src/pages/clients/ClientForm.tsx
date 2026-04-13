import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { createCliente, getClienteById, updateCliente } from "../../services/clienteService";
import { BackButton } from "../../components/common/BackButton";

import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";
import { OutlinedButton } from "../../components/common/OutlinedButton";

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [form, setForm] = useState({
    phone_number: "",
    nombre_completo: "",
    profile_name: "Manual",
    origen_cliente: "manual_admin",
  });
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      const loadCliente = async () => {
        try {
          const data = await getClienteById(id);
          const c = data.data || data;
          setForm({
            phone_number: c.phone_number || "",
            nombre_completo: c.nombre_completo || c.profile_name || "",
            profile_name: c.profile_name || "Manual",
            origen_cliente: c.origen_cliente || "manual_admin",
          });
        } catch (err) {
          alert("Error cargando el cliente");
        } finally {
          setInitLoading(false);
        }
      };
      loadCliente();
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateCliente(id!, form);
      } else {
        await createCliente(form);
      }
      navigate("/clientes");
    } catch (err) {
      alert(isEditing ? "Error actualizando cliente" : "Error creando cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BackButton to="/clientes" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
        </Typography>
      </Box>

      {initLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
      <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Teléfono (con código país, ej 549...)"
            value={form.phone_number}
            variant="outlined"
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <Input
            label="Nombre Completo"
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
            {isEditing ? "Guardar Cambios" : "Guardar"}
          </ContainedButton>
        </form>
      </CustomPaper>
      )}
    </Box>
  );
}
