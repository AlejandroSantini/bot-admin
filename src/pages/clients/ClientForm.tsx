import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createCliente } from "../../services/clienteService";

import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { ContainedButton } from "../../components/common/ContainedButton";

// Example tenant list - in a real app this should be configurable or fetched
const TENANT_OPTIONS = [
  { value: "nutricion", label: "nutricion" },
  { value: "default", label: "default" },
  { value: "demo", label: "demo" },
];

export default function ClientForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone_number: "",
    nombre_completo: "",
    tenant_id: "nutricion",
    profile_name: "Manual",
    origen_cliente: "manual_admin",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCliente(form);
      navigate("/clientes");
    } catch (err) {
      alert("Error creando cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h5" mb={3}>
        Nuevo Cliente
      </Typography>
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
          <Select
            label="Tenant ID"
            value={form.tenant_id}
            onChange={(e) =>
              setForm({ ...form, tenant_id: e.target.value as string })
            }
            options={TENANT_OPTIONS}
            sx={{ mb: 2 }}
          />

          <ContainedButton type="submit" loading={loading} fullWidth>
            Guardar
          </ContainedButton>
        </form>
      </CustomPaper>
    </Box>
  );
}
