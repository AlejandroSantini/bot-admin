import api from "./api";

export interface Campaign {
  id?: number | string;
  nombre: string;
  mensaje: string;
  estado?: string;
  tenant_id?: number;
  created_at?: string;
  updated_at?: string;
  template_name?: string | null;
  image_url?: string | null;
  image?: File | null;
  ejecutar_ahora?: boolean | string;
}

export const getCampaigns = async () => {
  const response = await api.get("/api/campanas");
  return response.data;
};

export const getCampaignById = async (id: string | number) => {
  const response = await api.get(`/api/campanas/${id}`);
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

export const updateCampaign = async (id: string | number, data: FormData) => {
  const response = await api.patch(`/api/campanas/${id}`, data, {
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

export const deleteCampaign = async (id: string | number) => {
  const response = await api.delete(`/api/campanas/${id}`);
  return response.data;
};
