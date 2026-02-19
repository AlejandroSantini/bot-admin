import api from "./api";

export const createService = async (data: any) => {
  const response = await api.post("/api/servicios", data);
  return response.data;
};

export const getServices = async (tenantId?: string) => {
  const response = await api.get("/api/servicios", {
    params: tenantId ? { tenantId } : undefined,
  });
  return response.data;
};

export const updateService = async (id: string | number, data: any) => {
  const response = await api.put(`/api/servicios/${id}`, data);
  return response.data;
};

export const deleteService = async (id: string | number) => {
  const response = await api.delete(`/api/servicios/${id}`);
  return response.data;
};
