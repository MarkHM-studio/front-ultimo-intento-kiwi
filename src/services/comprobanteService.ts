import api from './api';
import type { 
  ComprobanteRequest, 
  ComprobanteResponse,
  AsignarMesasRequest,
  RegistrarVentaRequest,
  PedidoDetalleResponse,
  MesasOcupadasResponse
} from '@/types';

export const comprobanteService = {
  // Get all comprobantes
  getAll: async (): Promise<ComprobanteResponse[]> => {
    const response = await api.get<ComprobanteResponse[]>('/comprobante');
    return response.data;
  },

  // Get comprobante by id
  getById: async (id: number): Promise<ComprobanteResponse> => {
    const response = await api.get<ComprobanteResponse>(`/comprobante/${id}`);
    return response.data;
  },

  // Create comprobante
  create: async (data: ComprobanteRequest): Promise<ComprobanteResponse> => {
    const response = await api.post<ComprobanteResponse>('/comprobante', data);
    return response.data;
  },

  // Asignar mesas a comprobante
  asignarMesas: async (data: AsignarMesasRequest): Promise<ComprobanteResponse> => {
    const response = await api.put<ComprobanteResponse>('/comprobante/asignar-mesas', data);
    return response.data;
  },

  // Registrar venta
  registrarVenta: async (data: RegistrarVentaRequest): Promise<string> => {
    const response = await api.post<string>('/comprobante/registrar-venta', data);
    return response.data;
  },

  // Get pedidos by comprobante
  getPedidosByComprobante: async (comprobanteId: number): Promise<PedidoDetalleResponse[]> => {
    const response = await api.get<PedidoDetalleResponse[]>(`/pedido/comprobante/${comprobanteId}/detalle`);
    return response.data;
  },

  // Get mesas ocupadas
  getMesasOcupadas: async (): Promise<MesasOcupadasResponse[]> => {
    const response = await api.get<MesasOcupadasResponse[]>('/mesa/ocupadas');
    return response.data;
  }
};

export default comprobanteService;
