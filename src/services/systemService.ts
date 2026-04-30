import api from './api';

let modulesCache: { id: string; label: string }[] | null = null;

export const systemService = {
  async getModules(): Promise<{ id: string; label: string }[]> {
    if (modulesCache) return modulesCache;
    try {
      const response = await api.get('/api/system/modules');
      modulesCache = response.data.modules;
      return modulesCache!;
    } catch (error) {
      console.error('Error in systemService.getModules:', error);
      return [];
    }
  }
};
