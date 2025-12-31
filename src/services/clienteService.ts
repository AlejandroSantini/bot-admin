import api from "./api";

export const getClientes = async () => {
  // MOCK DATA FOR DEMO
  return [
    {
      id: 1,
      phone_number: "5491112345678",
      nombre_completo: "Juan Perez",
      origen_cliente: "whatsapp",
      tenant_id: "nutricion",
    },
    {
      id: 2,
      phone_number: "5491187654321",
      nombre_completo: "Maria Garcia",
      origen_cliente: "instagram",
      tenant_id: "nutricion",
    },
    {
      id: 3,
      phone_number: "5491144445555",
      nombre_completo: "Carlos Lopez",
      origen_cliente: "manual_admin",
      tenant_id: "default",
    },
  ];
};

export const createCliente = async (data: any) => {
  const response = await api.post("/api/clientes", data);
  return response.data;
};

export const deleteCliente = async (id: string | number) => {
  const response = await api.delete(`/api/clientes/${id}`);
  return response.data;
};
