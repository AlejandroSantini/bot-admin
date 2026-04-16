import { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { getProducts } from "../../services/productoService";
import type { Product } from "../../services/productoService";
import { Select } from "./Select";
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
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentQty, setCurrentQty] = useState<number>(1);

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const res = await getProducts();
        const list = Array.isArray(res) ? res : res.data || [];
        setAvailableProducts(list);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchAvailableProducts();
  }, []);

  const addItem = () => {
    if (!currentProduct) return;
    const name = currentProduct.nombre;
    const price = Number(currentProduct.precio);
    const qty = Number(currentQty) || 1;
    const productId = currentProduct.id;

    onChange([...items, { id: productId, nombre: name, cantidad: qty, precio: price * qty }]);
    
    setCurrentProduct(null);
    setCurrentQty(1);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 2, mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Agregar Productos
      </Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "stretch", mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Select
            label="Producto"
            value={currentProduct?.id || ""}
            onChange={(e: any) => {
              const prod = availableProducts.find(p => p.id === e.target.value);
              setCurrentProduct(prod || null);
            }}
            options={[
              { value: "", label: "Seleccionar producto..." },
              ...availableProducts.map((p) => ({
                value: p.id!,
                label: `${p.nombre} - $${p.precio}`
              }))
            ]}
            sx={{ mt: 0, mb: 0 }}
          />
        </Box>
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
        <ContainedButton 
          onClick={addItem} 
          disabled={!currentProduct}
        >
          +
        </ContainedButton>
      </Box>

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
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                {item.nombre} x{item.cantidad} - <strong>${item.precio}</strong>
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
