import api from "./api";

export interface Product {
  id?: number;
  nombre: string;
  codigo: string;
  precio: number | string;
  stock: number;
  activo?: boolean;
  tenant_id?: number;
  created_at?: string;
}

export const getProducts = async (params?: { search?: string; activo?: boolean; page?: number; limit?: number }) => {
  const response = await api.get("/api/productos", { params });
  return response.data;
};

export const getProduct = async (id: string | number) => {
  const response = await api.get(`/api/productos/${id}`);
  return response.data;
};

export const createProduct = async (data: Partial<Product>) => {
  const response = await api.post("/api/productos", data);
  return response.data;
};

export const updateProduct = async (id: string | number, data: Partial<Product>) => {
  const response = await api.put(`/api/productos/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string | number) => {
  const response = await api.delete(`/api/productos/${id}`);
  return response.data;
};
