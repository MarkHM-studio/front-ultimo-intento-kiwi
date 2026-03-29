import { rootApi } from './api';
import type { TransaccionResponse } from '@/types';

export const transaccionService = {
  getAll: async (): Promise<TransaccionResponse[]> => {
    const response = await rootApi.get<TransaccionResponse[]>('/transacciones');
    return response.data;
  },

  getById: async (id: number): Promise<TransaccionResponse> => {
    const response = await rootApi.get<TransaccionResponse>(`/transacciones/${id}`);
    return response.data;
  },
};

export default transaccionService;