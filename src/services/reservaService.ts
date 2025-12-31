import api from "./api";

export const crearReserva = async (data: any) => {
  const response = await api.post("/api/reservas", data);
  return response.data;
};

export const obtenerReservas = async (tenantId: string) => {
  // MOCK FOR DEMO
  return [
    {
      id: 1,
      fecha: "2025-12-31",
      horario: "10:00",
      nombre: "Juan Perez",
      rubro: "Consulta Nutrición",
      phone: "5491112345678",
    },
    {
      id: 2,
      fecha: "2025-12-31",
      horario: "14:30",
      nombre: "Maria Garcia",
      rubro: "Control",
      phone: "5491187654321",
    },
    {
      id: 3,
      fecha: "2026-01-02",
      horario: "09:00",
      nombre: "Pedro Almodovar",
      rubro: "Masaje",
      phone: "5491122223333",
    },
    {
      id: 4,
      fecha: "2025-12-30",
      horario: "11:00",
      nombre: "Ana Bolena",
      rubro: "Consulta",
      phone: "5491122223333",
    },
  ];
};

export const obtenerReservasPorTelefono = async (
  phone: string,
  tenantId: string
) => {
  try {
    const response = await api.get(`/api/reservas/telefono/${phone}`, {
      params: { tenantId },
    });
    return response.data;
  } catch (error) {
    console.warn("API Error, returning MOCK search results");
    return [
      {
        id: 1,
        fecha: "2025-12-31",
        horario: "10:00",
        nombre: "Juan Perez (Mock)",
        rubro: "Consulta Nutrición",
        phone: phone,
      },
    ];
  }
};

export const eliminarReserva = async (id: string | number) => {
  const response = await api.delete(`/api/reservas/${id}`);
  return response.data;
};
