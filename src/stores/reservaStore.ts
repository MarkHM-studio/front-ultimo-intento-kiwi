import { create } from 'zustand';
import type { 
  ReservaRequest, 
  ReservaResponse,
  MesasDisponiblesResponse,
  CrearPreferenciaPagoRequest,
  CrearPreferenciaPagoResponse
} from '@/types';
import { reservaService } from '@/services/reservaService';

interface ReservaState {
  // Estado
  reservas: ReservaResponse[];
  reservasUsuario: ReservaResponse[];
  reservaActual: ReservaResponse | null;
  mesasDisponibles: MesasDisponiblesResponse[];
  preferenciaPago: CrearPreferenciaPagoResponse | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchReservas: () => Promise<void>;
  fetchReservasByUsuario: () => Promise<void>;
  fetchReservaById: (id: number) => Promise<void>;
  createReserva: (data: ReservaRequest) => Promise<ReservaResponse>;
  updateReserva: (id: number, data: ReservaRequest) => Promise<ReservaResponse>;
  cancelarReserva: (id: number) => Promise<void>;
  fetchMesasDisponibles: (fecha: string, hora: string) => Promise<void>;
  crearPreferenciaPago: (data: CrearPreferenciaPagoRequest) => Promise<CrearPreferenciaPagoResponse>;
  clearReservaActual: () => void;
  clearPreferenciaPago: () => void;
  clearError: () => void;
}

export const useReservaStore = create<ReservaState>((set) => ({
  // Estado inicial
  reservas: [],
  reservasUsuario: [],
  reservaActual: null,
  mesasDisponibles: [],
  preferenciaPago: null,
  isLoading: false,
  error: null,

  // Fetch all reservas
  fetchReservas: async () => {
    set({ isLoading: true, error: null });
    try {
      const reservas = await reservaService.getAll();
      set({ reservas, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar reservas',
        isLoading: false 
      });
    }
  },

  // Fetch reservas by usuario
  fetchReservasByUsuario: async () => {
    set({ isLoading: true, error: null });
    try {
      const reservas = await reservaService.getByUsuario();
      set({ reservasUsuario: reservas, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar reservas',
        isLoading: false 
      });
    }
  },

  // Fetch reserva by id
  fetchReservaById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const reserva = await reservaService.getById(id);
      set({ reservaActual: reserva, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar reserva',
        isLoading: false 
      });
    }
  },

  // Create reserva
  createReserva: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const reserva = await reservaService.create(data);
      set(state => ({ 
        reservas: [...state.reservas, reserva],
        reservaActual: reserva,
        isLoading: false 
      }));
      return reserva;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al crear reserva',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update reserva
  updateReserva: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const reserva = await reservaService.update(id, data);
      set(state => ({
        reservas: state.reservas.map(r => 
          r.id === id ? reserva : r
        ),
        reservaActual: reserva,
        isLoading: false
      }));
      return reserva;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar reserva',
        isLoading: false 
      });
      throw error;
    }
  },

  // Cancelar reserva
  cancelarReserva: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await reservaService.cancelar(id);
      set(state => ({
        reservas: state.reservas.map(r => 
          r.id === id ? { ...r, estado: 'CANCELADO' as const } : r
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cancelar reserva',
        isLoading: false 
      });
      throw error;
    }
  },

  // Fetch mesas disponibles
  fetchMesasDisponibles: async (fecha: string, hora: string) => {
    set({ isLoading: true, error: null });
    try {
      const mesas = await reservaService.getMesasDisponibles(fecha, hora);
      set({ mesasDisponibles: mesas, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar mesas disponibles',
        isLoading: false 
      });
    }
  },

  // Crear preferencia de pago
  crearPreferenciaPago: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const preferencia = await reservaService.crearPreferenciaPago(data);
      set({ preferenciaPago: preferencia, isLoading: false });
      return preferencia;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al crear preferencia de pago',
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear reserva actual
  clearReservaActual: () => {
    set({ reservaActual: null });
  },

  // Clear preferencia pago
  clearPreferenciaPago: () => {
    set({ preferenciaPago: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
