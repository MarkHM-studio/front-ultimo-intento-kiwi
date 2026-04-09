import api from './api';
import type { MovimientoInsumoDetalleResponse, MovimientoInsumoListadoResponse } from '@/types';

export const movimientoInsumoService = {
  listar: async (): Promise<MovimientoInsumoListadoResponse[]> => {
    const response = await api.get<MovimientoInsumoListadoResponse[]>('/movimiento-insumo');
    return response.data;
  },

  obtenerDetalle: async (id: number): Promise<MovimientoInsumoDetalleResponse> => {
    const response = await api.get<MovimientoInsumoDetalleResponse>(`/movimiento-insumo/${id}`);
    return response.data;
  },
};

export default movimientoInsumoService;