import api from "./api";

export const getClientes = async () => {
  const response = await api.get("/api/clientes");
  return response.data;
};

export const createCliente = async (data: any) => {
  const response = await api.post("/api/clientes", data);
  return response.data;
};

export const deleteCliente = async (id: string | number) => {
  const response = await api.delete(`/api/clientes/${id}`);
  return response.data;
};
