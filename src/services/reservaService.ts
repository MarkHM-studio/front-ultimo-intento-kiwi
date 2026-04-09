import api from './api';
import type { 
  ReservaRequest, 
  ReservaResponse,
  MesasDisponiblesResponse,
  CrearPreferenciaPagoRequest,
  CrearPreferenciaPagoResponse
} from '@/types';

export const reservaService = {
  // Get all reservas
  getAll: async (): Promise<ReservaResponse[]> => {
    const response = await api.get<ReservaResponse[]>('/reserva');
    return response.data;
  },

  // Get reservas by usuario (cliente)
  getByUsuario: async (): Promise<ReservaResponse[]> => {
    const response = await api.get<ReservaResponse[]>('/reserva');
    return response.data;
  },

  // Get reserva by id
  getById: async (id: number): Promise<ReservaResponse> => {
    const response = await api.get<ReservaResponse>(`/reserva/${id}`);
    return response.data;
  },

  // Create reserva
  create: async (data: ReservaRequest): Promise<ReservaResponse> => {
    const response = await api.post<ReservaResponse>('/reserva', data);
    return response.data;
  },

  // Update reserva
  update: async (id: number, data: ReservaRequest): Promise<ReservaResponse> => {
    const response = await api.put<ReservaResponse>(`/reserva/${id}`, data);
    return response.data;
  },

  // Cancelar reserva
  cancelar: async (id: number): Promise<void> => {
    await api.patch(`/reserva/${id}/cancelar`);
  },

  // Verificar reserva (recepcionista)
  verificar: async (id: number): Promise<ReservaResponse> => {
    const response = await api.patch<ReservaResponse>(`/reserva/${id}/verificar`);
    return response.data;
  },

  // Get mesas disponibles
  getMesasDisponibles: async (fecha: string, hora: string): Promise<MesasDisponiblesResponse[]> => {
    const response = await api.get<MesasDisponiblesResponse[]>('/reserva/mesas-disponibles', {
      params: { fecha, hora }
    });
    return response.data;
  },

  // Crear preferencia de pago MercadoPago
  crearPreferenciaPago: async (data: CrearPreferenciaPagoRequest): Promise<CrearPreferenciaPagoResponse> => {
    const response = await api.post<CrearPreferenciaPagoResponse>('/mercadopago/preferencias', data);
    return response.data;
  }
};

export default reservaService;
