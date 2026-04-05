import api from "./api";

export const crearReserva = async (data: any) => {
  const response = await api.post("/api/reservas", data);
  return response.data;
};

export const obtenerReservas = async (params?: { telefono?: string }) => {
  const response = await api.get("/api/reservas", {
    params: params,
  });
  return response.data;
};

// obtenerReservas handles phone filtering via params now

export const cancelarReserva = async (id: string | number) => {
  const response = await api.delete(`/api/reservas/${id}`);
  return response.data;
};

export const obtenerReserva = async (id: string | number) => {
  const response = await api.get(`/api/reservas/${id}`);
  return response.data;
};

export const actualizarReserva = async (id: string | number, data: any) => {
  const response = await api.patch(`/api/reservas/${id}`, data);
  return response.data;
};
