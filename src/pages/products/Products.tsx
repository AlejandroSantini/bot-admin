import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table } from "../../components/common/Table";
import { Input } from "../../components/common/Input";
import { ContainedButton } from "../../components/common/ContainedButton";
import DeleteButton from "../../components/common/DeleteButton";
import { CustomPaper } from "../../components/common/CustomPaper";

import { getProducts, deleteProduct } from "../../services/productoService";
import type { Product } from "../../services/productoService";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadProducts = async (searchStr?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ search: searchStr });
      const list = Array.isArray(res) ? res : res.data || [];
      setProducts(list);
    } catch (err: any) {
      console.error(err);
      setError("Error cargando productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      loadProducts();
      return;
    }
    const timer = setTimeout(() => {
      loadProducts(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?"))
      return;
    try {
      await deleteProduct(id);
      loadProducts(search);
    } catch (err) {
      alert("Error al eliminar el producto");
    }
  };

  const columns = [
    { label: "Nombre", render: (p: Product) => p.nombre || "-" },
    { label: "Código", render: (p: Product) => p.codigo || "-" },
    { label: "Precio", render: (p: Product) => (p.precio ? `$${p.precio}` : "-") },
    { label: "Stock", render: (p: Product) => p.stock ?? "-" },
    {
      label: "Acciones",
      render: (p: Product) => (
        <DeleteButton
          onClick={(e) => {
            e?.stopPropagation();
            handleDelete(p.id!);
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Productos
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ width: 350 }}>
            <Input
              label="Buscar por Nombre o Código"
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
            onClick={() => navigate("/productos/nuevo")}
          >
            Nuevo Producto
          </ContainedButton>
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
          data={products}
          getRowKey={(p: Product) => p.id!}
          onRowClick={(p: Product) => navigate(`/productos/${p.id}`)}
          emptyMessage="No hay productos registrados."
        />
      )}
    </Box>
  );
}
