import api from './api';
import type { 
  EntradaRequest, 
  EntradaResponse,
  InsumoRequest,
  InsumoResponse,
  ProductoResponse,
  ProveedorResponse
} from '@/types';

export const almacenService = {
  // ============ ENTRADAS ============
  // Get all entradas
  getEntradas: async (): Promise<EntradaResponse[]> => {
    const response = await api.get<EntradaResponse[]>('/entrada');
    return response.data;
  },

  // Create entrada
  createEntrada: async (data: EntradaRequest): Promise<EntradaResponse> => {
    const response = await api.post<EntradaResponse>('/entrada', data);
    return response.data;
  },

  // Update entrada
  updateEntrada: async (id: number, data: EntradaRequest): Promise<EntradaResponse> => {
    const response = await api.put<EntradaResponse>(`/entrada/${id}`, data);
    return response.data;
  },

  // ============ INSUMOS ============
  // Get all insumos
  getInsumos: async (): Promise<InsumoResponse[]> => {
    const response = await api.get<InsumoResponse[]>('/insumo');
    return response.data;
  },

  // Create insumo
  createInsumo: async (data: InsumoRequest): Promise<InsumoResponse> => {
    const response = await api.post<InsumoResponse>('/insumo', data);
    return response.data;
  },

  // Update insumo (almacenero endpoint)
  updateInsumo: async (id: number, data: InsumoRequest): Promise<InsumoResponse> => {
    const response = await api.put<InsumoResponse>(`/insumo/${id}/almacenero`, data);
    return response.data;
  },

  // ============ PRODUCTOS ============
  // Get all productos
  getProductos: async (): Promise<ProductoResponse[]> => {
    const response = await api.get<ProductoResponse[]>('/producto');
    return response.data;
  },

  // ============ PROVEEDORES ============
  // Get all proveedores
  getProveedores: async (): Promise<ProveedorResponse[]> => {
    const response = await api.get<ProveedorResponse[]>('/proveedor');
    return response.data;
  }
};

export default almacenService;
