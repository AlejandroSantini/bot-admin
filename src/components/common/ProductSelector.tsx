import { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  TextField,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { getProducts } from "../../services/productoService";
import type { Product } from "../../services/productoService";
import { Input } from "./Input";
import { ContainedButton } from "./ContainedButton";

export interface SelectedProductItem {
  id?: string | number;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface ProductSelectorProps {
  items: SelectedProductItem[];
  onChange: (items: SelectedProductItem[]) => void;
}

export function ProductSelector({ items, onChange }: ProductSelectorProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentQty, setCurrentQty] = useState<number>(1);

  const loadProducts = async (searchStr?: string) => {
    setLoading(true);
    try {
      const res = await getProducts({ search: searchStr, activo: true, limit: 10 } as any);
      const list: Product[] = Array.isArray(res) ? res : res.data || [];
      setOptions(list);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (!inputValue) {
      loadProducts();
      return;
    }

    const timer = setTimeout(() => {
      loadProducts(inputValue);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, open]);

  const addItem = () => {
    if (!currentProduct) return;
    const qty = Number(currentQty) || 1;
    onChange([
      ...items,
      {
        id: currentProduct.id,
        nombre: currentProduct.nombre,
        cantidad: qty,
        precio: Number(currentProduct.precio) * qty,
      },
    ]);
    setCurrentProduct(null);
    setInputValue("");
    setCurrentQty(1);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1.5, mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Agregar Productos
      </Typography>

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 2 }}>
        {/* Autocomplete de búsqueda */}
        <Box sx={{ flex: 1 }}>
          <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            options={options}
            loading={loading}
            value={currentProduct}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={(_, newValue: Product | null) => {
              setCurrentProduct(newValue);
            }}
            getOptionLabel={(option) => option.nombre || ""}
            filterOptions={(x) => x}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box>
                  <Typography variant="body2">{option.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${Number(option.precio).toLocaleString("es-AR")}
                    {option.codigo ? ` · ${option.codigo}` : ""}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Producto"
                placeholder="Buscar por nombre o código..."
                size="small"
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: 40,
                    borderRadius: 1.5,
                    backgroundColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                    border: "1px solid",
                    borderColor: (theme: any) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                    "& input": { color: "text.primary", py: 0 },
                    '&:hover': {
                      borderColor: "primary.main",
                    },
                    '&.Mui-focused': {
                      borderColor: "primary.main",
                      boxShadow: (theme: any) => `0 0 0 3px ${theme.palette.primary.main}22`,
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiInputLabel-root": { top: -6 },
                  "& .MuiInputLabel-shrink": { top: 0 },
                }}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </Box>

        {/* Cantidad */}
        <Box sx={{ width: 80 }}>
          <Input
            label="Cant."
            type="number"
            variant="outlined"
            value={currentQty}
            onChange={(e: any) => setCurrentQty(Number(e.target.value))}
            sx={{ mb: 0 }}
          />
        </Box>

        {/* Botón agregar */}
        <ContainedButton onClick={addItem} disabled={!currentProduct} sx={{ alignSelf: "center" }}>
          +
        </ContainedButton>
      </Box>

      {/* Lista de productos seleccionados */}
      {items.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {items.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                mb: 1,
                backgroundColor: "action.hover",
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2">
                {item.nombre} x{item.cantidad} -{" "}
                <strong>${item.precio.toLocaleString("es-AR")}</strong>
              </Typography>
              <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
