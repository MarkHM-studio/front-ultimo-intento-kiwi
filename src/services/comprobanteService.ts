import api from './api';
import axios from 'axios';
import type { 
  ComprobanteRequest, 
  ComprobanteResponse,
  ComprobanteDetalleResponse,
  AsignarMesasRequest,
  RegistrarVentaRequest,
  PedidoDetalleResponse,
  MesasOcupadasResponse
} from '@/types';

export const comprobanteService = {
  normalizeComprobanteFields: (item: ComprobanteResponse): ComprobanteResponse => ({
    ...item,
    IGV: (item as any).IGV ?? (item as any).igv ?? 0,
    igv: (item as any).igv ?? (item as any).IGV ?? 0,
    fechaHoraApertura: (item as any).fechaHoraApertura ?? (item as any).fechaHoraApertura_ ?? (item as any).fechaHora_registro ?? (item as any).fechaHoraRegistro,
    fechaHora_apertura: (item as any).fechaHora_apertura ?? (item as any).fechaHoraApertura,
    fechaHoraVenta: (item as any).fechaHoraVenta ?? (item as any).fechaHora_venta ?? (item as any).fechaHora_actualizacion ?? (item as any).fechaHoraActualizacion,
    fechaHora_venta: (item as any).fechaHora_venta ?? (item as any).fechaHoraVenta,
    grupo: (item as any).grupo ?? (item as any).grupoResponse ?? undefined,
    grupoResponse: (item as any).grupoResponse ?? (item as any).grupo ?? undefined,
  }),

  normalizeComprobanteDetalleFields: (item: ComprobanteDetalleResponse): ComprobanteDetalleResponse => ({
    ...item,
    IGV: (item as any).IGV ?? (item as any).igv ?? 0,
    igv: (item as any).igv ?? (item as any).IGV ?? 0,
    fechaHora_apertura: (item as any).fechaHora_apertura ?? (item as any).fechaHoraApertura,
    fechaHora_venta: (item as any).fechaHora_venta ?? (item as any).fechaHoraVenta,
    movimientosTipoPago: ((item as any).movimientosTipoPago ?? []).map((mov: any) => ({
      ...mov,
      tipoPagoId: mov.tipoPagoId ?? mov.tipo_pago_id,
      tipoPagoNombre: mov.tipoPagoNombre ?? mov.tipoPago,
      tipoBilleteraVirtualId: mov.tipoBilleteraVirtualId ?? mov.tipo_billetera_virtual_id,
      tipoBilleteraVirtualNombre: mov.tipoBilleteraVirtualNombre ?? mov.tipoBilleteraVirtual,
    })),
  }),

  // Get all comprobantes
  getAll: async (): Promise<ComprobanteResponse[]> => {
    const response = await api.get<ComprobanteResponse[]>('/comprobante');
    return response.data.map((item) => comprobanteService.normalizeComprobanteFields(item));
  },

  // Get comprobante by id
  getById: async (id: number): Promise<ComprobanteDetalleResponse> => {
    const response = await api.get<ComprobanteDetalleResponse>(`/comprobante/${id}/detalle`);
    return comprobanteService.normalizeComprobanteDetalleFields(response.data);
  },

  // Create comprobante
  create: async (data: ComprobanteRequest): Promise<ComprobanteResponse> => {
    const response = await api.post<ComprobanteResponse>('/comprobante', data);
    return comprobanteService.normalizeComprobanteFields(response.data);
  },

  // Asignar mesas a comprobante
  asignarMesas: async (data: AsignarMesasRequest): Promise<ComprobanteResponse> => {
    const response = await api.put<ComprobanteResponse>('/comprobante/asignar-mesas', data);
    return comprobanteService.normalizeComprobanteFields(response.data);
  },

  // Registrar venta
  registrarVenta: async (data: RegistrarVentaRequest): Promise<string> => {
    const response = await api.post<string>('/comprobante/registrar-venta', data);
    return response.data;
  },

  // Get pedidos by comprobante
  getPedidosByComprobante: async (comprobanteId: number): Promise<PedidoDetalleResponse[]> => {
    try {
      const response = await api.get<PedidoDetalleResponse[]>(`/pedido/comprobante/${comprobanteId}/detalle`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = (error.response?.data as { message?: string } | undefined)?.message;
        if (error.response?.status === 409 && backendMessage === 'No hay pedidos para este comprobante') {
          return [];
        }
      }
      throw error;
    }
  },

  // Get mesas ocupadas
  getMesasOcupadas: async (): Promise<MesasOcupadasResponse[]> => {
    const response = await api.get<MesasOcupadasResponse[]>('/mesa/ocupadas');
    return response.data;
  }
};

export default comprobanteService;