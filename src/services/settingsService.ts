import api from "./api";

export interface ScheduleDayConfig {
  enabled: boolean;
  ranges?: { start: string; end: string }[];
  interval?: number;
  slots?: string[];
}

export interface ScheduleConfig {
  [key: string]: ScheduleDayConfig;
}

export interface ReminderConfig {
  [key: string]: number;
}

export interface PaymentConfig {
  alias: string;
  deposit_amount: number;
  cancellation_hours: number;
  payment_enabled: boolean;
  require_payment_for: "all" | "new_only";
}

export interface ModulesConfig {
  cancellation_notice_enabled: boolean;
  [key: string]: any;
}

export interface TenantInfo {
  id: number;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  plan?: string;
  modules_config: ModulesConfig;
  reminder_config?: ReminderConfig | null;
}

export const settingsService = {
  // TENANT INFO
  getMe: async (): Promise<TenantInfo> => {
    const response = await api.get("/api/tenants/me");
    return response.data?.data || response.data;
  },

  // SCHEDULE
  getSchedule: async () => {
    const response = await api.get("/api/tenants/schedule");
    return response.data;
  },
  updateSchedule: async (config: { schedule_config: ScheduleConfig }) => {
    const response = await api.put("/api/tenants/schedule", config);
    return response.data;
  },

  // PAYMENTS
  getPaymentConfig: async (): Promise<PaymentConfig> => {
    const response = await api.get("/api/tenants/payment");
    return response.data?.data || response.data;
  },
  updatePaymentConfig: async (config: { payment_config: PaymentConfig }) => {
    const response = await api.put("/api/tenants/payment", config);
    return response.data;
  },

  // REMINDERS
  getReminders: async () => {
    try {
      const response = await api.get("/api/tenants/reminders");
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return { reminder_config: null };
      }
      throw err;
    }
  },
  updateReminders: async (config: { reminder_config: ReminderConfig }) => {
    const response = await api.put("/api/tenants/reminders", config);
    return response.data;
  },

  // MODULES CONFIG (SYSTEM)
  updateModulesConfig: async (config: { modules_config: ModulesConfig }) => {
    const response = await api.put("/api/tenants/modules-config", config);
    return response.data;
  },

  // BLOCKED DATES
  getBlockedDates: async (): Promise<{ blocked_dates: BlockedDate[] }> => {
    const response = await api.get("/api/tenants/blocked-dates");
    return { blocked_dates: response.data.data };
  },
  updateBlockedDates: async (config: { blocked_dates: BlockedDate[] }) => {
    const response = await api.put("/api/tenants/blocked-dates", config);
    return response.data;
  },

  // ADMIN NOTIFICATIONS
  getConfig: async () => {
    const response = await api.get("/api/tenants/config");
    return response.data;
  },
  updateConfig: async (payload: { config: any }) => {
    const response = await api.put("/api/tenants/config", payload);

    return response.data;
  },
  getBilling: async () => {
    const response = await api.get("/api/tenants/billing");
    return response.data;
  }
};

export interface BlockedDate {
  start: string;
  end: string;
  reason: string;
}
