import api from "./api";

export const getClientes = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await api.get("/api/clientes", { params });
  return response.data;
};

export const getClienteById = async (id: string | number) => {
  const response = await api.get(`/api/clientes/${id}`);
  return response.data;
};

export const createCliente = async (data: any) => {
  const response = await api.post("/api/clientes", data);
  return response.data;
};

export const updateCliente = async (id: string | number, data: any) => {
  const response = await api.patch(`/api/clientes/${id}`, data);
  return response.data;
};

export const deleteCliente = async (id: string | number) => {
  const response = await api.delete(`/api/clientes/${id}`);
  return response.data;
};

export const getFichasCliente = async (params: { cliente_id?: string | number; phone?: string }) => {
  const response = await api.get("/api/reservas/fichas", {
    params,
  });
  return response.data;
};

export const pauseCliente = async (id: string | number, paused: boolean) => {
  const response = await api.patch(`/api/clientes/${id}/pause`, { paused });
  return response.data;
};
