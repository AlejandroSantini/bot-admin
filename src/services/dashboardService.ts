import api from "./api";

export interface DashboardStats {
  mensajes_enviados: number;
  turnos_confirmados: number;
  clientes_atendidos: number;
  dinero_generado: number;
  turnos_cancelados: number;
  tasa_cancelacion: string;
  trends: {
    mensajes_enviados: string;
    dinero_generado: string;
    clientes_atendidos: string;
  };
  history: {
    date: string;
    count: number;
  }[];
}

export const dashboardService = {
  getStats: async (filter: "day" | "weekly" | "monthly" | "yearly" = "weekly"): Promise<DashboardStats> => {
    const response = await api.get(`/api/dashboard?filter=${filter}`);
    return response.data?.data || response.data;
  },
};
