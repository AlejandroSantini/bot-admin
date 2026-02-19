import api from "./api";

export const crearReserva = async (data: any) => {
  const response = await api.post("/api/reservas", data);
  return response.data;
};

export const obtenerReservas = async (tenantId?: string) => {
  const response = await api.get("/api/reservas", {
    params: tenantId ? { tenantId } : undefined,
  });
  return response.data;
};

export const obtenerReservasPorTelefono = async (
  phone: string,
  tenantId?: string,
) => {
  const response = await api.get(`/api/reservas/telefono/${phone}`, {
    params: tenantId ? { tenantId } : undefined,
  });
  return response.data;
};

export const eliminarReserva = async (id: string | number) => {
  const response = await api.delete(`/api/reservas/${id}`);
  return response.data;
};
