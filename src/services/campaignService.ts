import api from "./api";

export interface Campaign {
  id?: number | string;
  nombre: string;
  mensaje: string;
  ejecutar_ahora?: boolean | string;
  image?: File | null;
  status?: string;
  created_at?: string;
}

export const getCampaigns = async () => {
  const response = await api.get("/api/campanas");
  return response.data;
};

export const createCampaign = async (data: FormData) => {
  const response = await api.post("/api/campanas", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const runCampaign = async (id: string | number) => {
  const response = await api.post(`/api/campanas/${id}/run`);
  return response.data;
};
