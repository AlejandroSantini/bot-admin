import api from "./api";

export const createService = async (data: any) => {
  const response = await api.post("/api/services", data);
  return response.data;
};

export const getServices = async (tenantId: string) => {
  // MOCK FOR DEMO
  return [
    {
      id: 101,
      name: "Consulta Nutrición",
      description: "Consulta inicial completa",
      price: 5000,
      duration: 60,
      tenant_id: "nutricion",
    },
    {
      id: 102,
      name: "Control Quincenal",
      description: "Seguimiento de plan",
      price: 3000,
      duration: 30,
      tenant_id: "nutricion",
    },
    {
      id: 103,
      name: "Plan Personalizado",
      description: "Envío de plan por mail",
      price: 4000,
      duration: 0,
      tenant_id: "nutricion",
    },
  ];
};

export const updateService = async (id: string | number, data: any) => {
  const response = await api.put(`/api/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id: string | number) => {
  const response = await api.delete(`/api/services/${id}`);
  return response.data;
};
