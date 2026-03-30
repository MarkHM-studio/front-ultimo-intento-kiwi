import { create } from 'zustand';
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
  DashboardStats
} from '@/types';
import { adminService } from '@/services/adminService';

interface AdminState {
  // Estado - Productos
  productos: ProductoResponse[];
  productoActual: ProductoResponse | null;
  
  // Estado - Insumos
  insumos: InsumoResponse[];
  insumoActual: InsumoResponse | null;
  
  // Estado - Categorias
  categorias: CategoriaResponse[];
  categoriaActual: CategoriaResponse | null;
  
  // Estado - Marcas
  marcas: MarcaResponse[];
  marcaActual: MarcaResponse | null;
  
  // Estado - Proveedores
  proveedores: ProveedorResponse[];
  proveedorActual: ProveedorResponse | null;
  
  // Estado - Usuarios
  usuarios: UsuarioResponse[];
  usuarioActual: UsuarioResponse | null;
  
  // Estado - Clientes
  clientes: Cliente[];
  clienteActual: Cliente | null;
  
  // Estado - Trabajadores
  trabajadores: Trabajador[];
  trabajadorActual: Trabajador | null;
  
  // Estado - Mesas
  mesas: MesaResponse[];
  mesaActual: MesaResponse | null;
  
  // Estado - Recetas
  recetas: RecetaResponse[];
  recetasPorProducto: RecetaResponse[];
  
  // Estado - Dashboard
  dashboardStats: DashboardStats | null;
  
  // Estado general
  isLoading: boolean;
  error: string | null;

  // Acciones - Productos
  fetchProductos: () => Promise<void>;
  fetchProductoById: (id: number) => Promise<void>;
  createProducto: (data: ProductoRequest) => Promise<ProductoResponse>;
  updateProducto: (id: number, data: ProductoRequest) => Promise<ProductoResponse>;
  deleteProducto: (id: number) => Promise<void>;

  // Acciones - Insumos
  fetchInsumos: () => Promise<void>;
  fetchInsumoById: (id: number) => Promise<void>;
  createInsumo: (data: InsumoRequest) => Promise<InsumoResponse>;
  updateInsumo: (id: number, data: InsumoRequest, isAdmin: boolean) => Promise<InsumoResponse>;

  // Acciones - Categorias
  fetchCategorias: () => Promise<void>;
  createCategoria: (data: CategoriaRequest) => Promise<CategoriaResponse>;
  updateCategoria: (id: number, data: CategoriaRequest) => Promise<CategoriaResponse>;
  deleteCategoria: (id: number) => Promise<void>;

  // Acciones - Marcas
  fetchMarcas: () => Promise<void>;
  createMarca: (data: MarcaRequest) => Promise<MarcaResponse>;
  updateMarca: (id: number, data: MarcaRequest) => Promise<MarcaResponse>;
  deleteMarca: (id: number) => Promise<void>;

  // Acciones - Proveedores
  fetchProveedores: () => Promise<void>;
  createProveedor: (data: ProveedorRequest) => Promise<ProveedorResponse>;
  updateProveedor: (id: number, data: ProveedorRequest) => Promise<ProveedorResponse>;
  deleteProveedor: (id: number) => Promise<void>;

  // Acciones - Usuarios
  fetchUsuarios: (estado?: 'ACTIVO' | 'INACTIVO') => Promise<void>;
  createUsuario: (data: UsuarioRequest) => Promise<UsuarioResponse>;
  updateUsuario: (id: number, data: UsuarioRequest) => Promise<UsuarioResponse>;
  deleteUsuario: (id: number) => Promise<void>;
  activateUsuario: (id: number) => Promise<void>;

  // Acciones - Clientes
  fetchClientes: (estado?: 'ACTIVO' | 'INACTIVO') => Promise<void>;
  createCliente: (data: ClienteRequest) => Promise<Cliente>;
  updateCliente: (id: number, data: ClienteRequest) => Promise<Cliente>;
  deleteCliente: (id: number) => Promise<void>;
  activateCliente: (id: number) => Promise<void>;

  // Acciones - Trabajadores
  fetchTrabajadores: (estado?: 'ACTIVO' | 'INACTIVO') => Promise<void>;
  createTrabajador: (data: TrabajadorRequest) => Promise<Trabajador>;
  updateTrabajador: (id: number, data: TrabajadorRequest) => Promise<Trabajador>;
  deleteTrabajador: (id: number) => Promise<void>;
  activateTrabajador: (id: number) => Promise<void>;

  // Acciones - Mesas
  fetchMesas: () => Promise<void>;
  createMesa: (data: MesaRequest) => Promise<MesaResponse>;
  updateMesa: (id: number, data: MesaRequest) => Promise<MesaResponse>;
  deleteMesa: (id: number) => Promise<void>;

  // Acciones - Recetas
  fetchRecetas: () => Promise<void>;
  fetchRecetasByProducto: (productoId: number) => Promise<void>;
  createReceta: (data: RecetaRequest) => Promise<RecetaResponse>;
  updateReceta: (productoId: number, data: RecetaRequest[]) => Promise<RecetaResponse[]>;

  // Acciones - Dashboard
  fetchDashboardStats: () => Promise<void>;

  // Acciones generales
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Estado inicial
  productos: [],
  productoActual: null,
  insumos: [],
  insumoActual: null,
  categorias: [],
  categoriaActual: null,
  marcas: [],
  marcaActual: null,
  proveedores: [],
  proveedorActual: null,
  usuarios: [],
  usuarioActual: null,
  clientes: [],
  clienteActual: null,
  trabajadores: [],
  trabajadorActual: null,
  mesas: [],
  mesaActual: null,
  recetas: [],
  recetasPorProducto: [],
  dashboardStats: null,
  isLoading: false,
  error: null,

  // ============ PRODUCTOS ============
  fetchProductos: async () => {
    set({ isLoading: true, error: null });
    try {
      const productos = await adminService.getProductos();
      set({ productos, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar productos', isLoading: false });
    }
  },

  fetchProductoById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const producto = await adminService.getProductoById(id);
      set({ productoActual: producto, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar producto', isLoading: false });
    }
  },

  createProducto: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const producto = await adminService.createProducto(data);
      set(state => ({ productos: [...state.productos, producto], isLoading: false }));
      return producto;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear producto', isLoading: false });
      throw error;
    }
  },

  updateProducto: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const producto = await adminService.updateProducto(id, data);
      set(state => ({
        productos: state.productos.map(p => p.id === id ? producto : p),
        isLoading: false
      }));
      return producto;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar producto', isLoading: false });
      throw error;
    }
  },

  deleteProducto: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteProducto(id);
      set(state => ({
        productos: state.productos.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar producto', isLoading: false });
      throw error;
    }
  },

  // ============ INSUMOS ============
  fetchInsumos: async () => {
    set({ isLoading: true, error: null });
    try {
      const insumos = await adminService.getInsumos();
      set({ insumos, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar insumos', isLoading: false });
    }
  },

  fetchInsumoById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const insumo = await adminService.getInsumoById(id);
      set({ insumoActual: insumo, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar insumo', isLoading: false });
    }
  },

  createInsumo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const insumo = await adminService.createInsumo(data);
      set(state => ({ insumos: [...state.insumos, insumo], isLoading: false }));
      return insumo;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear insumo', isLoading: false });
      throw error;
    }
  },

  updateInsumo: async (id, data, isAdmin) => {
    set({ isLoading: true, error: null });
    try {
      const insumo = await adminService.updateInsumo(id, data, isAdmin);
      set(state => ({
        insumos: state.insumos.map(i => i.id === id ? insumo : i),
        isLoading: false
      }));
      return insumo;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar insumo', isLoading: false });
      throw error;
    }
  },

  // ============ CATEGORIAS ============
  fetchCategorias: async () => {
    set({ isLoading: true, error: null });
    try {
      const categorias = await adminService.getCategorias();
      set({ categorias, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar categorías', isLoading: false });
    }
  },

  createCategoria: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const categoria = await adminService.createCategoria(data);
      set(state => ({ categorias: [...state.categorias, categoria], isLoading: false }));
      return categoria;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear categoría', isLoading: false });
      throw error;
    }
  },

  updateCategoria: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const categoria = await adminService.updateCategoria(id, data);
      set(state => ({
        categorias: state.categorias.map(c => c.id === id ? categoria : c),
        isLoading: false
      }));
      return categoria;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar categoría', isLoading: false });
      throw error;
    }
  },

  deleteCategoria: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteCategoria(id);
      set(state => ({
        categorias: state.categorias.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar categoría', isLoading: false });
      throw error;
    }
  },

  // ============ MARCAS ============
  fetchMarcas: async () => {
    set({ isLoading: true, error: null });
    try {
      const marcas = await adminService.getMarcas();
      set({ marcas, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar marcas', isLoading: false });
    }
  },

  createMarca: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const marca = await adminService.createMarca(data);
      set(state => ({ marcas: [...state.marcas, marca], isLoading: false }));
      return marca;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear marca', isLoading: false });
      throw error;
    }
  },

  updateMarca: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const marca = await adminService.updateMarca(id, data);
      set(state => ({
        marcas: state.marcas.map(m => m.id === id ? marca : m),
        isLoading: false
      }));
      return marca;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar marca', isLoading: false });
      throw error;
    }
  },

  deleteMarca: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteMarca(id);
      set(state => ({
        marcas: state.marcas.filter(m => m.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar marca', isLoading: false });
      throw error;
    }
  },

  // ============ PROVEEDORES ============
  fetchProveedores: async () => {
    set({ isLoading: true, error: null });
    try {
      const proveedores = await adminService.getProveedores();
      set({ proveedores, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar proveedores', isLoading: false });
    }
  },

  createProveedor: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const proveedor = await adminService.createProveedor(data);
      set(state => ({ proveedores: [...state.proveedores, proveedor], isLoading: false }));
      return proveedor;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear proveedor', isLoading: false });
      throw error;
    }
  },

  updateProveedor: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const proveedor = await adminService.updateProveedor(id, data);
      set(state => ({
        proveedores: state.proveedores.map(p => p.id === id ? proveedor : p),
        isLoading: false
      }));
      return proveedor;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar proveedor', isLoading: false });
      throw error;
    }
  },

  deleteProveedor: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteProveedor(id);
      set(state => ({
        proveedores: state.proveedores.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar proveedor', isLoading: false });
      throw error;
    }
  },

  // ============ USUARIOS ============
  fetchUsuarios: async (estado) => {
    set({ isLoading: true, error: null });
    try {
      const usuarios = await adminService.getUsuarios(estado);
      set({ usuarios, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar usuarios', isLoading: false });
    }
  },

  createUsuario: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const usuario = await adminService.createUsuario(data);
      set(state => ({ usuarios: [...state.usuarios, usuario], isLoading: false }));
      return usuario;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear usuario', isLoading: false });
      throw error;
    }
  },

  updateUsuario: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const usuario = await adminService.updateUsuario(id, data);
      set(state => ({
        usuarios: state.usuarios.map(u => u.id === id ? usuario : u),
        isLoading: false
      }));
      return usuario;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar usuario', isLoading: false });
      throw error;
    }
  },

  deleteUsuario: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteUsuario(id);
      set(state => ({
        usuarios: state.usuarios.map(u => u.id === id ? { ...u, estado: 'INACTIVO' } : u),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar usuario', isLoading: false });
      throw error;
    }
  },

  activateUsuario: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.activateUsuario(id);
      set(state => ({
        usuarios: state.usuarios.map(u => u.id === id ? { ...u, estado: 'ACTIVO' } : u),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al activar usuario', isLoading: false });
      throw error;
    }
  },

  // ============ CLIENTES ============
  fetchClientes: async (estado) => {
    set({ isLoading: true, error: null });
    try {
      const clientes = await adminService.getClientes(estado);
      set({ clientes, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar clientes', isLoading: false });
    }
  },

  createCliente: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const cliente = await adminService.createCliente(data);
      set(state => ({ clientes: [...state.clientes, cliente], isLoading: false }));
      return cliente;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear cliente', isLoading: false });
      throw error;
    }
  },

  updateCliente: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const cliente = await adminService.updateCliente(id, data);
      set(state => ({
        clientes: state.clientes.map(c => c.id === id ? cliente : c),
        isLoading: false
      }));
      return cliente;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar cliente', isLoading: false });
      throw error;
    }
  },

  deleteCliente: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteCliente(id);
      set(state => ({
        clientes: state.clientes.map(c => c.id === id ? { ...c, estado: 'INACTIVO' } : c),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar cliente', isLoading: false });
      throw error;
    }
  },

  activateCliente: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.activateCliente(id);
      set(state => ({
        clientes: state.clientes.map(c => c.id === id ? { ...c, estado: 'ACTIVO' } : c),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al activar cliente', isLoading: false });
      throw error;
    }
  },

  // ============ TRABAJADORES ============
  fetchTrabajadores: async (estado) => {
    set({ isLoading: true, error: null });
    try {
      const trabajadores = await adminService.getTrabajadores(estado);
      set({ trabajadores, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar trabajadores', isLoading: false });
    }
  },

  createTrabajador: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const trabajador = await adminService.createTrabajador(data);
      set(state => ({ trabajadores: [...state.trabajadores, trabajador], isLoading: false }));
      return trabajador;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear trabajador', isLoading: false });
      throw error;
    }
  },

  updateTrabajador: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const trabajador = await adminService.updateTrabajador(id, data);
      set(state => ({
        trabajadores: state.trabajadores.map(t => t.id === id ? trabajador : t),
        isLoading: false
      }));
      return trabajador;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar trabajador', isLoading: false });
      throw error;
    }
  },

  deleteTrabajador: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteTrabajador(id);
      set(state => ({
        trabajadores: state.trabajadores.map(t => t.id === id ? { ...t, estado: 'INACTIVO' } : t),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar trabajador', isLoading: false });
      throw error;
    }
  },

  activateTrabajador: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.activateTrabajador(id);
      set(state => ({
        trabajadores: state.trabajadores.map(t => t.id === id ? { ...t, estado: 'ACTIVO' } : t),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al activar trabajador', isLoading: false });
      throw error;
    }
  },

  // ============ MESAS ============
  fetchMesas: async () => {
    set({ isLoading: true, error: null });
    try {
      const mesas = await adminService.getMesas();
      set({ mesas, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar mesas', isLoading: false });
    }
  },

  createMesa: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const mesa = await adminService.createMesa(data);
      set(state => ({ mesas: [...state.mesas, mesa], isLoading: false }));
      return mesa;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear mesa', isLoading: false });
      throw error;
    }
  },

  updateMesa: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const mesa = await adminService.updateMesa(id, data);
      set(state => ({
        mesas: state.mesas.map(m => m.id === id ? mesa : m),
        isLoading: false
      }));
      return mesa;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar mesa', isLoading: false });
      throw error;
    }
  },

  deleteMesa: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteMesa(id);
      set(state => ({
        mesas: state.mesas.filter(m => m.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar mesa', isLoading: false });
      throw error;
    }
  },

  // ============ RECETAS ============
  fetchRecetas: async () => {
    set({ isLoading: true, error: null });
    try {
      const recetas = await adminService.getRecetas();
      set({ recetas, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar recetas', isLoading: false });
    }
  },

  fetchRecetasByProducto: async (productoId: number) => {
    set({ isLoading: true, error: null });
    try {
      const recetas = await adminService.getRecetasByProducto(productoId);
      set({ recetasPorProducto: recetas, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar recetas', isLoading: false });
    }
  },

  createReceta: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const receta = await adminService.createReceta(data);
      set(state => ({ recetas: [...state.recetas, receta], isLoading: false }));
      return receta;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear receta', isLoading: false });
      throw error;
    }
  },

  updateReceta: async (productoId, data) => {
    set({ isLoading: true, error: null });
    try {
      const recetas = await adminService.updateReceta(productoId, data);
      set({ recetasPorProducto: recetas, isLoading: false });
      return recetas;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar receta', isLoading: false });
      throw error;
    }
  },

  // ============ DASHBOARD ============
  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await adminService.getDashboardStats();
      set({ dashboardStats: stats, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar estadísticas', isLoading: false });
    }
  },

  // ============ GENERAL ============
  clearError: () => {
    set({ error: null });
  }
}));
