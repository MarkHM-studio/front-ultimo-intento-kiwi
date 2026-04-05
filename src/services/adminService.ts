import api from './api';
import type { 
  ProductoRequest, ProductoResponse,
  InsumoRequest, InsumoResponse,
  CategoriaRequest, CategoriaResponse,
  MarcaRequest, MarcaResponse,
  ProveedorRequest, ProveedorResponse,
  UsuarioRequest, UsuarioResponse,
  Cliente, ClienteRequest,
  Trabajador, TrabajadorRequest,
  MesaRequest, MesaResponse,
  RecetaRequest, RecetaResponse,
  DashboardStats,
  ComprobanteResponse,
  MesasOcupadasResponse
} from '@/types';

export const adminService = {
  // Compatibilidad de auditoría cuando el backend envía campos con guiones bajos.
  normalizeAuditFields: <T extends Record<string, any>>(item: T): T => ({
    ...item,
    fechaHoraRegistro: item.fechaHoraRegistro ?? item.fechaHora_Registro ?? item.fechaHora_registro,
    fechaHoraActualizacion: item.fechaHoraActualizacion ?? item.fechaHora_Actualizacion ?? item.fechaHora_actualizacion,
  }),

  // ============ PRODUCTOS ============
  getProductos: async (): Promise<ProductoResponse[]> => {
    const response = await api.get<ProductoResponse[]>('/producto');
    return response.data;
  },

  getProductoById: async (id: number): Promise<ProductoResponse> => {
    const response = await api.get<ProductoResponse>(`/producto/${id}`);
    return response.data;
  },

  createProducto: async (data: ProductoRequest): Promise<ProductoResponse> => {
    const response = await api.post<ProductoResponse>('/producto', data);
    return response.data;
  },

  updateProducto: async (id: number, data: ProductoRequest): Promise<ProductoResponse> => {
    const response = await api.put<ProductoResponse>(`/producto/${id}`, data);
    return response.data;
  },

  deleteProducto: async (id: number): Promise<void> => {
    await api.delete(`/producto/${id}`);
  },

  // ============ INSUMOS ============
  getInsumos: async (): Promise<InsumoResponse[]> => {
    const response = await api.get<InsumoResponse[]>('/insumo');
    return response.data.map((item: any) => ({
      ...item,
      categoriaId: item.categoriaId ?? item.categoria?.id,
    }));
  },

  getInsumoById: async (id: number): Promise<InsumoResponse> => {
    const response = await api.get<InsumoResponse>(`/insumo/${id}`);
    return response.data;
  },

  createInsumo: async (data: InsumoRequest): Promise<InsumoResponse> => {
    const response = await api.post<InsumoResponse>('/insumo', data);
    return response.data;
  },

  updateInsumo: async (id: number, data: InsumoRequest, isAdmin: boolean): Promise<InsumoResponse> => {
    const endpoint = isAdmin ? `/insumo/${id}/admin` : `/insumo/${id}/almacenero`;
    const response = await api.put<InsumoResponse>(endpoint, data);
    return response.data;
  },

   // ============ CATEGORIAS ============
  getCategorias: async (): Promise<CategoriaResponse[]> => {
    const response = await api.get<CategoriaResponse[]>('/categoria');
    return response.data.map((item) => adminService.normalizeAuditFields(item));
  },

  createCategoria: async (data: CategoriaRequest): Promise<CategoriaResponse> => {
    const response = await api.post<CategoriaResponse>('/categoria', data);
    return response.data;
  },

  updateCategoria: async (id: number, data: CategoriaRequest): Promise<CategoriaResponse> => {
    const response = await api.put<CategoriaResponse>(`/categoria/${id}`, data);
    return response.data;
  },

  deleteCategoria: async (id: number): Promise<void> => {
    await api.delete(`/categoria/${id}`);
  },

  // ============ MARCAS ============
  getMarcas: async (): Promise<MarcaResponse[]> => {
    const response = await api.get<MarcaResponse[]>('/marca');
    return response.data.map((item) => adminService.normalizeAuditFields(item));
  },

  createMarca: async (data: MarcaRequest): Promise<MarcaResponse> => {
    const response = await api.post<MarcaResponse>('/marca', data);
    return response.data;
  },

  updateMarca: async (id: number, data: MarcaRequest): Promise<MarcaResponse> => {
    const response = await api.put<MarcaResponse>(`/marca/${id}`, data);
    return response.data;
  },

  deleteMarca: async (id: number): Promise<void> => {
    await api.delete(`/marca/${id}`);
  },

  // ============ PROVEEDORES ============
  getProveedores: async (): Promise<ProveedorResponse[]> => {
    const response = await api.get<ProveedorResponse[]>('/proveedor');
    return response.data;
  },

  createProveedor: async (data: ProveedorRequest): Promise<ProveedorResponse> => {
    const response = await api.post<ProveedorResponse>('/proveedor', data);
    return response.data;
  },

  updateProveedor: async (id: number, data: ProveedorRequest): Promise<ProveedorResponse> => {
    const response = await api.put<ProveedorResponse>(`/proveedor/${id}`, data);
    return response.data;
  },

  deleteProveedor: async (id: number): Promise<void> => {
    await api.delete(`/proveedor/${id}`);
  },

  // ============ USUARIOS ============
  getUsuarios: async (estado?: 'ACTIVO' | 'INACTIVO'): Promise<UsuarioResponse[]> => {
    const response = await api.get<UsuarioResponse[]>('/usuario', { params: estado ? { estado } : undefined });
    return response.data;
  },

  createUsuario: async (data: UsuarioRequest): Promise<UsuarioResponse> => {
    const response = await api.post<UsuarioResponse>('/usuario', data);
    return response.data;
  },

  updateUsuario: async (id: number, data: UsuarioRequest): Promise<UsuarioResponse> => {
    const response = await api.put<UsuarioResponse>(`/usuario/${id}`, data);
    return response.data;
  },

  deleteUsuario: async (id: number): Promise<void> => {
    await api.delete(`/usuario/${id}`);
  },

  activateUsuario: async (id: number): Promise<void> => {
    await api.patch(`/usuario/${id}/activar`);
  },

  // ============ CLIENTES ============
  getClientes: async (estado?: 'ACTIVO' | 'INACTIVO'): Promise<Cliente[]> => {
    const response = await api.get<Cliente[]>('/cliente', { params: estado ? { estado } : undefined });
    return response.data;
  },

  createCliente: async (data: ClienteRequest): Promise<Cliente> => {
    const response = await api.post<Cliente>('/cliente', data);
    return response.data;
  },

  updateCliente: async (id: number, data: ClienteRequest): Promise<Cliente> => {
    const response = await api.put<Cliente>(`/cliente/${id}`, data);
    return response.data;
  },

  deleteCliente: async (id: number): Promise<void> => {
    await api.delete(`/cliente/${id}`);
  },

  activateCliente: async (id: number): Promise<void> => {
    await api.patch(`/cliente/${id}/activar`);
  },

  // ============ TRABAJADORES ============
  getTrabajadores: async (estado?: 'ACTIVO' | 'INACTIVO'): Promise<Trabajador[]> => {
    const response = await api.get<Trabajador[]>('/trabajador', { params: estado ? { estado } : undefined });
    return response.data;
  },

  createTrabajador: async (data: TrabajadorRequest): Promise<Trabajador> => {
    const response = await api.post<Trabajador>('/trabajador', data);
    return response.data;
  },

  updateTrabajador: async (id: number, data: TrabajadorRequest): Promise<Trabajador> => {
    const response = await api.put<Trabajador>(`/trabajador/${id}`, data);
    return response.data;
  },

  deleteTrabajador: async (id: number): Promise<void> => {
    await api.delete(`/trabajador/${id}`);
  },

  activateTrabajador: async (id: number): Promise<void> => {
    await api.patch(`/trabajador/${id}/activar`);
  },

  // ============ MESAS ============
  getMesas: async (): Promise<MesaResponse[]> => {
    const response = await api.get<MesaResponse[]>('/mesa');
    return response.data.map((item) => adminService.normalizeAuditFields(item));
  },

  createMesa: async (data: MesaRequest): Promise<MesaResponse> => {
    const response = await api.post<MesaResponse>('/mesa', data);
    return response.data;
  },

  updateMesa: async (id: number, data: MesaRequest): Promise<MesaResponse> => {
    const response = await api.put<MesaResponse>(`/mesa/${id}`, data);
    return response.data;
  },

  deleteMesa: async (id: number): Promise<void> => {
    await api.delete(`/mesa/${id}`);
  },

  // ============ RECETAS ============
  getRecetas: async (): Promise<RecetaResponse[]> => {
    const response = await api.get<RecetaResponse[]>('/receta');
    return response.data;
  },

  getRecetasByProducto: async (productoId: number): Promise<RecetaResponse[]> => {
    const response = await api.get<RecetaResponse[]>(`/receta/producto/${productoId}`);
    return response.data;
  },

  createReceta: async (data: RecetaRequest): Promise<RecetaResponse[]> => {
    const response = await api.post<RecetaResponse[]>('/receta', data);
    return response.data;
  },

  updateReceta: async (productoId: number, data: RecetaRequest): Promise<RecetaResponse[]> => {
    const response = await api.put<RecetaResponse[]>(`/receta/producto/${productoId}`, data);
    return response.data;
  },

  // ============ DASHBOARD ============
  getDashboardStats: async (): Promise<DashboardStats> => {
    const [comprobantesResponse, mesasResponse] = await Promise.all([
      api.get<ComprobanteResponse[]>('/comprobante'),
      api.get<MesasOcupadasResponse[]>('/mesa/ocupadas'),
    ]);

    const comprobantes = comprobantesResponse.data;
    const mesas = mesasResponse.data;
    const today = new Date().toISOString().slice(0, 10);

    const ventasHoy = comprobantes
      .filter((c) => c.estado === 'PAGADO' && c.fechaHoraVenta?.slice(0, 10) === today)
      .reduce((sum, c) => sum + c.total, 0);

    const totalVentasHoy = comprobantes.filter(
      (c) => c.estado === 'PAGADO' && c.fechaHoraVenta?.slice(0, 10) === today
    ).length;

    return {
      ventasHoy,
      totalPedidosHoy: totalVentasHoy,
      mesasOcupadas: mesas.length,
      reservasPendientes: 0,
      ventasSemana: comprobantes.filter((c) => c.estado === 'PAGADO').reduce((sum, c) => sum + c.total, 0),
      ventasMes: comprobantes.filter((c) => c.estado === 'PAGADO').reduce((sum, c) => sum + c.total, 0),
    };
  }
};

export default adminService;