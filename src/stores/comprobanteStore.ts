import { create } from 'zustand';
import type { 
  ComprobanteRequest, 
  ComprobanteResponse,
  ComprobanteDetalleResponse,
  AsignarMesasRequest,
  RegistrarVentaRequest,
  PedidoDetalleResponse,
  MesasOcupadasResponse
} from '@/types';
import { comprobanteService } from '@/services/comprobanteService';

interface ComprobanteState {
  // Estado
  comprobantes: ComprobanteResponse[];
  comprobanteActual: ComprobanteDetalleResponse | null;
  pedidosComprobante: PedidoDetalleResponse[];
  mesasOcupadas: MesasOcupadasResponse[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchComprobantes: () => Promise<void>;
  fetchComprobanteById: (id: number) => Promise<void>;
  createComprobante: (data: ComprobanteRequest) => Promise<ComprobanteResponse>;
  asignarMesas: (data: AsignarMesasRequest) => Promise<ComprobanteResponse>;
  registrarVenta: (data: RegistrarVentaRequest) => Promise<string>;
  fetchPedidosByComprobante: (comprobanteId: number) => Promise<void>;
  fetchMesasOcupadas: () => Promise<void>;
  clearComprobanteActual: () => void;
  clearError: () => void;
}

export const useComprobanteStore = create<ComprobanteState>((set, get) => ({
  // Estado inicial
  comprobantes: [],
  comprobanteActual: null,
  pedidosComprobante: [],
  mesasOcupadas: [],
  isLoading: false,
  error: null,

  // Fetch all comprobantes
  fetchComprobantes: async () => {
    set({ isLoading: true, error: null });
    try {
      const comprobantes = await comprobanteService.getAll();
      set({ comprobantes, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar comprobantes',
        isLoading: false 
      });
    }
  },

  // Fetch comprobante by id
  fetchComprobanteById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const comprobante = await comprobanteService.getById(id);
      set({ comprobanteActual: comprobante, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar comprobante',
        isLoading: false 
      });
    }
  },

  // Create comprobante
  createComprobante: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const comprobante = await comprobanteService.create(data);
      set(state => ({ 
        comprobantes: [...state.comprobantes, comprobante],
        comprobanteActual: null,
        isLoading: false 
      }));
      return comprobante;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al crear comprobante',
        isLoading: false 
      });
      throw error;
    }
  },

  // Asignar mesas
  asignarMesas: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const comprobante = await comprobanteService.asignarMesas(data);
      set(state => ({
        comprobantes: state.comprobantes.map(c => 
          c.id === comprobante.id ? comprobante : c
        ),
        
        isLoading: false
      }));
      return comprobante;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al asignar mesas',
        isLoading: false 
      });
      throw error;
    }
  },

  // Registrar venta
  registrarVenta: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const mensaje = await comprobanteService.registrarVenta(data);
      set({ isLoading: false });
      // Refresh comprobantes after sale
      await get().fetchComprobantes();
      return mensaje;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al registrar venta',
        isLoading: false 
      });
      throw error;
    }
  },

  // Fetch pedidos by comprobante
  fetchPedidosByComprobante: async (comprobanteId: number) => {
    set({ isLoading: true, error: null });
    try {
      const pedidos = await comprobanteService.getPedidosByComprobante(comprobanteId);
      set({ pedidosComprobante: pedidos, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar pedidos',
        isLoading: false 
      });
    }
  },

  // Fetch mesas ocupadas
  fetchMesasOcupadas: async () => {
    set({ isLoading: true, error: null });
    try {
      const mesas = await comprobanteService.getMesasOcupadas();
      set({ mesasOcupadas: mesas, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar mesas ocupadas',
        isLoading: false 
      });
    }
  },

  // Clear comprobante actual
  clearComprobanteActual: () => {
    set({ comprobanteActual: null, pedidosComprobante: [] });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
