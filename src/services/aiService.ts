import api from './api';

export const aiService = {
  async processInstruction(instruction: string, context?: any): Promise<any> {
    try {
      const response = await api.post('/api/ai/generate-action', { instruction, context });
      return response.data;
    } catch (error) {
      console.error('Error in aiService.processInstruction:', error);
      throw error;
    }
  }
};
