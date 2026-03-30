// ============================================
// TIPOS BASE Y ENUMS
// ============================================

export type RolNombre = 'CLIENTE' | 'MOZO' | 'COCINERO' | 'BARTENDER' | 'CAJERO' | 'RECEPCIONISTA' | 'ALMACENERO' | 'ADMINISTRADOR';

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

export type EstadoComprobante = 'ABIERTO' | 'PAGADO' | 'CANCELADO';

export type EstadoPedido = 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'PAGADO';

export type EstadoReserva = 'ESPERANDO PAGO' | 'PAGADO' | 'CANCELADO' | 'EXPIRADO';

export type EstadoMesa = 'OCUPADO' | 'DESOCUPADO';

// TipoEntrega como string literal para requests
export type TipoEntregaValue = 'COMER' | 'LLEVAR';

export type TipoPago = 'EFECTIVO' | 'BILLETERA VIRTUAL';

export type TipoBilleteraVirtual = 'YAPE' | 'PLIN';

export type TipoComprobante = 'BOLETA' | 'FACTURA';

export type TipoUsuario = 1 | 2; // 1 = Cliente, 2 = Trabajador

export type Provider = 'LOCAL' | 'GOOGLE';

// ============================================
// ENTIDADES BASE
// ============================================

export interface Rol {
  id: number;
  nombre: RolNombre;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Usuario {
  id: number;
  username: string;
  tipoUsuario: TipoUsuario;
  estado: EstadoUsuario;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  rol: Rol;
  provider: Provider;
  proveedorId?: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  estado: EstadoUsuario;
  tipoCliente: 'NUEVO' | 'REGULAR' | 'FRECUENTE';
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  usuario: Usuario;
  distrito: Distrito;
}

export interface Trabajador {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  correo: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoUsuario;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  usuario: Usuario;
  tipoJornada: TipoJornada;
  turno: Turno;
}

export interface TipoJornada {
  id: number;
  nombre: 'TIEMPO COMPLETO' | 'TIEMPO PARCIAL';
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Horario {
  id: number;
  horaInicio: string;
  horaFin: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Turno {
  id: number;
  nombre: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  horario: Horario;
}

export interface Distrito {
  id: number;
  nombre: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Marca {
  id: number;
  nombre: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  fechaInscripcion: string;
  fechaModificacion: string;
  categoria: Categoria;
  marca?: Marca;
}

export interface Insumo {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  unidadMedida: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  marca?: Marca;
}

export interface Receta {
  id: number;
  cantidad: number;
  unidadMedida: string;
  fechaInscripcion: string;
  fechaModificacion: string;
  producto: Producto;
  insumo: Insumo;
}

export interface Proveedor {
  id: number;
  contacto: string;
  razonSocial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: EstadoUsuario;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  ruc: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Mesa {
  id: number;
  nombre: string;
  estado: EstadoMesa;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Grupo {
  id: number;
  nombre: string;
  estado: 'ACTIVO' | 'INACTIVO';
  tipoGrupo: number;
  fechaHoraInicioConsumo?: string;
  fechaHoraLiberacion?: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface DetalleMesa {
  id: number;
  mesa: Mesa;
  grupo: Grupo;
}

export interface TipoEntrega {
  id: number;
  nombre: TipoEntregaValue;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface Comprobante {
  id: number;
  total: number;
  igv: number;
  subtotal: number;
  fechaHoraApertura: string;
  fechaHoraVenta?: string;
  estado: EstadoComprobante;
  grupo?: Grupo;
  usuario: Usuario;
  sucursal: Sucursal;
}

export interface Pedido {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: EstadoPedido;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  producto: Producto;
  comprobante: Comprobante;
  tipoEntrega: TipoEntrega;
  usuario: Usuario;
}

export interface Reserva {
  id: number;
  fechaReserva: string;
  horaReserva: string;
  numPersonas: number;
  estado: EstadoReserva;
  fechaHoraExpiracionPago?: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  usuario: Usuario;
  grupo: Grupo;
}

export interface Transaccion {
  id: number;
  mercadoPagoPaymentId?: string;
  mercadoPagoPreferenceId: string;
  externalReference: string;
  estado: string;
  estadoMercadoPago: string;
  detalleEstadoMercadoPago: string;
  monto: number;
  fechaPago?: string;
  fechaActualizacion: string;
  usuario: Usuario;
  reserva: Reserva;
}

export type TransaccionResponse = Transaccion;

export interface Entrada {
  id: number;
  cantidadTotal: number;
  unidadMedida: string;
  costoUnitario: number;
  costoTotal: number;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  producto?: Producto;
  insumo?: Insumo;
  proveedor: Proveedor;
  usuario: Usuario;
}

export interface MovimientoTipoPago {
  id: number;
  monto: number;
  tipoPago: TipoPago;
  comprobante: Comprobante;
  tipoBilleteraVirtual?: TipoBilleteraVirtual;
}

// ============================================
// REQUESTS Y RESPONSES - AUTH
// ============================================

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuarioId: number;
  correo: string;
  rol: RolNombre;
  provider: Provider;
}

export interface UsuarioClienteRequest {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
  distrito: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  usuarioId: number;
  correo: string;
  rol: RolNombre;
  proveedor: Provider;
  cliente: Cliente;
}

export interface ForgotPasswordRequest {
  correo: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetTokenRequest {
  correo: string;
  token: string;
}

export interface VerifyResetTokenResponse {
  message: string;
  correo: string;
  expiresAt: string;
}

export interface ResetPasswordRequest {
  correo: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface AuthMeResponse {
  usuarioId: number;
  correo: string;
  rol: RolNombre;
  provider: Provider;
  estado: EstadoUsuario;
  clienteId?: number;
  nombreCompleto?: string;
  foto?: string;
}

// ============================================
// REQUESTS Y RESPONSES - COMPROBANTE
// ============================================

export interface ComprobanteRequest {
  sucursalId: number;
}

export interface ComprobanteResponse {
  id: number;
  total: number;
  igv: number;
  subtotal: number;
  fechaHoraApertura: string;
  fechaHoraVenta?: string;
  estado: EstadoComprobante;
  grupo?: GrupoResponse;
  usuario: Usuario;
  sucursal: Sucursal;
}

export interface GrupoResponse {
  id: number;
  nombre: string;
  estado: string;
  tipoGrupo: number;
  mesas: Mesa[];
}

export interface AsignarMesasRequest {
  comprobanteId: number;
  mesasId: number[];
  nombreGrupo: string;
}

export interface RegistrarVentaRequest {
  usuarioId: number;
  comprobanteId: number;
  tiposPago: TipoPago[];
  montos: number[];
  billetera?: TipoBilleteraVirtual;
  tipoComprobante: TipoComprobante;
  dni?: string;
  ruc?: string;
  sucursalId: number;
}

// ============================================
// REQUESTS Y RESPONSES - PEDIDO
// ============================================

export interface PedidoRequest {
  cantidad: number;
  comprobanteId: number;
  productoId: number;
  tipoEntregaId: number;
  usuarioId: number;
}

export interface PedidoResponse {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: EstadoPedido;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  producto: Producto;
  comprobante: Comprobante;
  tipoEntrega: TipoEntrega;
  usuario: Usuario;
}

export interface PedidoDetalleResponse {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: EstadoPedido;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  producto: Producto;
  tipoEntrega: TipoEntrega;
  usuario: Usuario;
}

export interface MesasOcupadasResponse {
  mesaId: number;
  mesaNombre: string;
  grupoId: number;
  grupoNombre: string;
  comprobanteId: number;
}

// ============================================
// REQUESTS Y RESPONSES - RESERVA
// ============================================

export interface ReservaRequest {
  fechaReserva: string;
  horaReserva: string;
  numPersonas: number;
  usuarioId: number;
  mesasId: number[];
  sucursalId: number;
}

export interface ReservaResponse {
  id: number;
  fechaReserva: string;
  horaReserva: string;
  numPersonas: number;
  estado: EstadoReserva;
  fechaHoraExpiracionPago?: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  usuario: Usuario;
  grupo: Grupo;
}

export interface MesasDisponiblesResponse {
  mesaId: number;
  mesaNombre: string;
  capacidad: number;
  estado: EstadoMesa;
  horaDesocupacion?: string;
}

export interface CrearPreferenciaPagoRequest {
  reservaId: number;
  descripcion: string;
  monto: number;
}

export interface CrearPreferenciaPagoResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

// ============================================
// REQUESTS Y RESPONSES - ALMACEN
// ============================================

export interface EntradaRequest {
  cantidadTotal: number;
  unidadMedida: string;
  costoUnitario: number;
  productoId?: number;
  insumoId?: number;
  proveedorId: number;
  usuarioId: number;
}

export interface EntradaResponse {
  id: number;
  cantidadTotal: number;
  unidadMedida: string;
  costoUnitario: number;
  costoTotal: number;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  producto?: Producto;
  insumo?: Insumo;
  proveedor: Proveedor;
  usuario: Usuario;
}

export interface InsumoRequest {
  nombre: string;
  precio: number;
  stock: number;
  unidadMedida: string;
  marcaId?: number;
}

export interface InsumoResponse {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  unidadMedida: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  marca?: Marca;
}

// ============================================
// REQUESTS Y RESPONSES - ADMIN
// ============================================

export interface ProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  categoriaId: number;
  marcaId?: number;
}

export interface ProductoResponse {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  fechaInscripcion: string;
  fechaModificacion: string;
  categoria: Categoria;
  marca?: Marca;
}

export interface CategoriaRequest {
  nombre: string;
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface MarcaRequest {
  nombre: string;
}

export interface MarcaResponse {
  id: number;
  nombre: string;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface ProveedorRequest {
  contacto: string;
  razonSocial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export interface ProveedorResponse {
  id: number;
  contacto: string;
  razonSocial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: EstadoUsuario;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface UsuarioRequest {
  username: string;
  password?: string;
  tipoUsuario: TipoUsuario;
  estado: EstadoUsuario;
  rolId: number;
}

export interface UsuarioResponse {
  id: number;
  username: string;
  tipoUsuario: TipoUsuario;
  estado: EstadoUsuario;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
  rol: Rol;
  provider: Provider;
}

export interface ClienteRequest {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  distritoId: number;
  usuarioId: number;
}

export interface TrabajadorRequest {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  correo: string;
  fechaInicio: string;
  fechaFin?: string;
  estado?: EstadoUsuario;
  usuarioId: number;
  tipoJornadaId: number;
  turnoId: number;
}

export interface MesaRequest {
  nombre: string;
}

export interface MesaResponse {
  id: number;
  nombre: string;
  estado: EstadoMesa;
  fechaHoraRegistro: string;
  fechaHoraActualizacion: string;
}

export interface RecetaRequest {
  cantidad: number;
  unidadMedida: string;
  productoId: number;
  insumoId: number;
}

export interface RecetaResponse {
  id: number;
  cantidad: number;
  unidadMedida: string;
  fechaInscripcion: string;
  fechaModificacion: string;
  producto: Producto;
  insumo: Insumo;
}

// ============================================
// DASHBOARD Y ESTADÍSTICAS
// ============================================

export interface VentasDia {
  fecha: string;
  total: number;
  cantidadVentas: number;
}

export interface VentasSemana {
  semana: string;
  total: number;
  cantidadVentas: number;
}

export interface VentasMes {
  mes: string;
  total: number;
  cantidadVentas: number;
}

export interface ProductoMasVendido {
  productoId: number;
  productoNombre: string;
  cantidadVendida: number;
  totalRecaudado: number;
}

export interface DashboardStats {
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  totalPedidosHoy: number;
  mesasOcupadas: number;
  reservasPendientes: number;
}

// ============================================
// CONTEXT Y NAVIGATION
// ============================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: RolNombre[];
}

export interface UserContextType {
  user: AuthMeResponse | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (roles: RolNombre[]) => boolean;
}
