import { create } from 'zustand';
import type { MovimientoInsumoDetalleResponse, MovimientoInsumoListadoResponse } from '@/types';
import { movimientoInsumoService } from '@/services/movimientoInsumoService';

interface MovimientoInsumoState {
  movimientos: MovimientoInsumoListadoResponse[];
  movimientoActual: MovimientoInsumoDetalleResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchMovimientos: () => Promise<void>;
  fetchMovimientoDetalle: (id: number) => Promise<void>;
  clearMovimientoActual: () => void;
}

export const useMovimientoInsumoStore = create<MovimientoInsumoState>((set) => ({
  movimientos: [],
  movimientoActual: null,
  isLoading: false,
  error: null,

  fetchMovimientos: async () => {
    set({ isLoading: true, error: null });
    try {
      const movimientos = await movimientoInsumoService.listar();
      set({ movimientos, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar salidas',
        isLoading: false,
      });
    }
  },

  fetchMovimientoDetalle: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const movimientoActual = await movimientoInsumoService.obtenerDetalle(id);
      set({ movimientoActual, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar detalle de salida',
        isLoading: false,
      });
    }
  },

  clearMovimientoActual: () => set({ movimientoActual: null }),
}));