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
  const [form, setForm] = useState({
    phone_number: "",
    nombre_completo: "",
    origen_cliente: "manual_admin",
  });
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

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
        } catch (err) {
          alert("Error cargando el cliente");
        } finally {
          setInitLoading(false);
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
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
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
      )}
    </Box>
  );
}
