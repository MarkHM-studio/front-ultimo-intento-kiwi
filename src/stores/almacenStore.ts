import { create } from 'zustand';
import type { 
  EntradaRequest, 
  EntradaResponse,
  InsumoRequest,
  InsumoResponse,
  ProductoResponse,
  ProveedorResponse
} from '@/types';
import { almacenService } from '@/services/almacenService';

interface AlmacenState {
  // Estado
  entradas: EntradaResponse[];
  entradaActual: EntradaResponse | null;
  insumos: InsumoResponse[];
  insumoActual: InsumoResponse | null;
  productos: ProductoResponse[];
  proveedores: ProveedorResponse[];
  isLoading: boolean;
  error: string | null;

  // Acciones - Entradas
  fetchEntradas: () => Promise<void>;
  createEntrada: (data: EntradaRequest) => Promise<EntradaResponse>;
  updateEntrada: (id: number, data: EntradaRequest) => Promise<EntradaResponse>;

  // Acciones - Insumos
  fetchInsumos: () => Promise<void>;
  createInsumo: (data: InsumoRequest) => Promise<InsumoResponse>;
  updateInsumo: (id: number, data: InsumoRequest) => Promise<InsumoResponse>;

  // Acciones - Productos y Proveedores
  fetchProductos: () => Promise<void>;
  fetchProveedores: () => Promise<void>;

  // Acciones generales
  clearEntradaActual: () => void;
  clearInsumoActual: () => void;
  clearError: () => void;
}

export const useAlmacenStore = create<AlmacenState>((set, get) => ({
  // Estado inicial
  entradas: [],
  entradaActual: null,
  insumos: [],
  insumoActual: null,
  productos: [],
  proveedores: [],
  isLoading: false,
  error: null,

  // ============ ENTRADAS ============
  fetchEntradas: async () => {
    set({ isLoading: true, error: null });
    try {
      const entradas = await almacenService.getEntradas();
      set({ entradas, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar entradas',
        isLoading: false 
      });
    }
  },

  createEntrada: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const entrada = await almacenService.createEntrada(data);
      set(state => ({ 
        entradas: [...state.entradas, entrada],
        isLoading: false 
      }));
      // Refresh insumos and productos after creating entrada
      await get().fetchInsumos();
      await get().fetchProductos();
      return entrada;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al crear entrada',
        isLoading: false 
      });
      throw error;
    }
  },

  updateEntrada: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const entrada = await almacenService.updateEntrada(id, data);
      set(state => ({
        entradas: state.entradas.map(e => e.id === id ? entrada : e),
        isLoading: false
      }));
      return entrada;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar entrada',
        isLoading: false 
      });
      throw error;
    }
  },

  // ============ INSUMOS ============
  fetchInsumos: async () => {
    set({ isLoading: true, error: null });
    try {
      const insumos = await almacenService.getInsumos();
      set({ insumos, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar insumos',
        isLoading: false 
      });
    }
  },

  createInsumo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const insumo = await almacenService.createInsumo(data);
      set(state => ({ 
        insumos: [...state.insumos, insumo],
        isLoading: false 
      }));
      return insumo;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al crear insumo',
        isLoading: false 
      });
      throw error;
    }
  },

  updateInsumo: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const insumo = await almacenService.updateInsumo(id, data);
      set(state => ({
        insumos: state.insumos.map(i => i.id === id ? insumo : i),
        isLoading: false
      }));
      return insumo;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar insumo',
        isLoading: false 
      });
      throw error;
    }
  },

  // ============ PRODUCTOS Y PROVEEDORES ============
  fetchProductos: async () => {
    set({ isLoading: true, error: null });
    try {
      const productos = await almacenService.getProductos();
      set({ productos, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar productos',
        isLoading: false 
      });
    }
  },

  fetchProveedores: async () => {
    set({ isLoading: true, error: null });
    try {
      const proveedores = await almacenService.getProveedores();
      set({ proveedores, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar proveedores',
        isLoading: false 
      });
    }
  },

  // ============ GENERAL ============
  clearEntradaActual: () => {
    set({ entradaActual: null });
  },

  clearInsumoActual: () => {
    set({ insumoActual: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
