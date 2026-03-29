import { create } from 'zustand';
import type { 
  PedidoRequest, 
  PedidoResponse,
  PedidoDetalleResponse,
  EstadoPedido
} from '@/types';
import { pedidoService } from '@/services/pedidoService';

interface PedidoState {
  // Estado
  pedidos: PedidoResponse[];
  pedidosPendientes: PedidoResponse[];
  pedidosPreparando: PedidoResponse[];
  pedidosListos: PedidoResponse[];
  pedidoActual: PedidoResponse | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchPedidos: () => Promise<void>;
  fetchPedidosByEstado: (estado: EstadoPedido) => Promise<void>;
  createPedido: (data: PedidoRequest) => Promise<PedidoDetalleResponse>;
  updatePedido: (id: number, data: PedidoRequest) => Promise<PedidoDetalleResponse>;
  marcarPreparando: (id: number) => Promise<void>;
  marcarListo: (id: number) => Promise<void>;
  clearPedidoActual: () => void;
  clearError: () => void;
}

export const usePedidoStore = create<PedidoState>((set, get) => ({
  // Estado inicial
  pedidos: [],
  pedidosPendientes: [],
  pedidosPreparando: [],
  pedidosListos: [],
  pedidoActual: null,
  isLoading: false,
  error: null,

  // Fetch all pedidos
  fetchPedidos: async () => {
    set({ isLoading: true, error: null });
    try {
      const pedidos = await pedidoService.getAll();
      set({ 
        pedidos, 
        pedidosPendientes: pedidos.filter(p => p.estado === 'PENDIENTE'),
        pedidosPreparando: pedidos.filter(p => p.estado === 'PREPARANDO'),
        pedidosListos: pedidos.filter(p => p.estado === 'LISTO'),
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar pedidos',
        isLoading: false 
      });
    }
  },

  // Fetch pedidos by estado
  fetchPedidosByEstado: async (estado: EstadoPedido) => {
    set({ isLoading: true, error: null });
    try {
      const pedidos = await pedidoService.getByEstado(estado);
      set({ 
        pedidos,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar pedidos',
        isLoading: false 
      });
    }
  },

  // Create pedido
  createPedido: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const pedido = await pedidoService.create(data);
      set(state => ({ 
        pedidos: [...state.pedidos, pedido as unknown as PedidoResponse],
        isLoading: false 
      }));
      return pedido;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al crear pedido',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update pedido
  updatePedido: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const pedido = await pedidoService.update(id, data);
      set(state => ({
        pedidos: state.pedidos.map(p => 
          p.id === id ? (pedido as unknown as PedidoResponse) : p
        ),
        isLoading: false
      }));
      return pedido;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar pedido',
        isLoading: false 
      });
      throw error;
    }
  },

  // Marcar como preparando
  marcarPreparando: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await pedidoService.marcarPreparando(id);
      // Refresh pedidos
      await get().fetchPedidos();
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar pedido',
        isLoading: false 
      });
      throw error;
    }
  },

  // Marcar como listo
  marcarListo: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await pedidoService.marcarListo(id);
      // Refresh pedidos
      await get().fetchPedidos();
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar pedido',
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear pedido actual
  clearPedidoActual: () => {
    set({ pedidoActual: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
