import { useState, useEffect } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  getProduct,
  createProduct,
  updateProduct,
} from "../../services/productoService";
import type { Product } from "../../services/productoService";
import { BackButton } from "../../components/common/BackButton";
import { CustomPaper } from "../../components/common/CustomPaper";
import { Input } from "../../components/common/Input";
import { ContainedButton } from "../../components/common/ContainedButton";

export default function ProductForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<Partial<Product>>({
    nombre: "",
    codigo: "",
    precio: "",
    stock: "" as any,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const res = await getProduct(id);
          if (res.data) {
            setForm(res.data);
          }
        } catch (err) {
          setError("Error cargando el producto");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateProduct(id, form);
        alert("Producto actualizado correctamente");
      } else {
        await createProduct(form);
        alert("Producto creado correctamente");
        navigate("/productos");
      }
    } catch (err) {
      alert("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BackButton to="/productos" state={location.state} />
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomPaper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre"
            value={form.nombre}
            variant="outlined"
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <Input
            label="Código"
            value={form.codigo}
            variant="outlined"
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <Input
            label="Precio"
            type="number"
            value={form.precio}
            variant="outlined"
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <Input
            label="Stock"
            type="number"
            value={form.stock}
            variant="outlined"
            onChange={(e) => setForm({ ...form, stock: e.target.value as any })}
            required
            sx={{ mb: 3 }}
          />

          <ContainedButton
            type="submit"
            loading={loading}
            fullWidth
          >
            {isEdit ? "Guardar Cambios" : "Crear Producto"}
          </ContainedButton>
        </form>
      </CustomPaper>
    </Box>
  );
}
