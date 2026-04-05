import api from './api';
import type { 
  PedidoRequest, 
  PedidoResponse,
  PedidoDetalleResponse,
  EstadoPedido
} from '@/types';

export const pedidoService = {
  normalizePedido: (p: PedidoResponse): PedidoResponse => ({
    ...p,
    fechaHoraRegistro: (p as any).fechaHoraRegistro ?? (p as any).fechaRegistro,
    productoId: (p as any).productoId ?? (p as any).producto?.id,
    comprobanteId: (p as any).comprobanteId ?? (p as any).comprobante?.id,
    tipoEntregaId: (p as any).tipoEntregaId ?? (p as any).tipoEntrega?.id,
    usuarioId: (p as any).usuarioId ?? (p as any).usuario?.id,
  }),

  // Get all pedidos
  getAll: async (): Promise<PedidoResponse[]> => {
    const response = await api.get<PedidoResponse[]>('/pedido');
    const base = response.data.map((p) => pedidoService.normalizePedido(p));

    const enriched = await Promise.all(base.map(async (pedido) => {
      if (pedido.producto?.nombre && pedido.usuario?.username) {
        return pedido;
      }

      try {
        const detail = await pedidoService.getDetalleById(pedido.id);
        return pedidoService.normalizePedido({
          ...pedido,
          producto: detail.producto,
          comprobante: detail.comprobante,
          tipoEntrega: detail.tipoEntregaResponse ?? detail.tipoEntrega,
          usuario: detail.usuarioResponse ?? detail.usuario,
        } as PedidoResponse);
      } catch {
        return pedido;
      }
    }));

    return enriched;
  },

  getDetalleById: async (id: number): Promise<PedidoDetalleResponse> => {
    const response = await api.get<PedidoDetalleResponse>(`/pedido/${id}/detalle`);
    return response.data;
  },


  // Get pedidos by estado
  getByEstado: async (estado: EstadoPedido): Promise<PedidoResponse[]> => {
    const response = await api.get<PedidoResponse[]>(`/pedido?estado=${estado}`);
    return response.data.map((p) => pedidoService.normalizePedido(p));
  },

  // Create pedido
  create: async (data: PedidoRequest): Promise<PedidoDetalleResponse> => {
    const response = await api.post<PedidoDetalleResponse>('/pedido', data);
    return response.data;
  },

  // Update pedido
  update: async (id: number, data: PedidoRequest): Promise<PedidoDetalleResponse> => {
    const response = await api.put<PedidoDetalleResponse>(`/pedido/${id}`, data);
    return response.data;
  },

  // Delete pedido
  delete: async (id: number): Promise<void> => {
    await api.delete(`/pedido/${id}`);
  },

  // Marcar pedido como preparando
  marcarPreparando: async (id: number): Promise<string> => {
    const response = await api.put<string>(`/pedido/${id}/preparando`);
    return response.data;
  },

  // Marcar pedido como listo
  marcarListo: async (id: number): Promise<string> => {
    const response = await api.put<string>(`/pedido/${id}/listo`);
    return response.data;
  },

   // Marcar pedido como entregado
  marcarEntregado: async (id: number): Promise<string> => {
    const response = await api.put<string>(`/pedido/${id}/entregado`);
    return response.data;
  }
};

export default pedidoService;
