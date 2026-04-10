import { useEffect, useState } from 'react';
import { useReservaStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, CheckCircle, Clock, Users, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import type { Cliente, MesaResponse } from '@/types';

export const RecepcionistaDashboard: React.FC = () => {
  const { reservas, reservaActual, transacciones, fetchReservas, fetchReservaById, cancelarReserva, verificarReserva, fetchTransacciones, isLoading } = useReservaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'EXPIRADO' | 'ESPERANDO PAGO' | 'CONFIRMADAS' | 'VERIFICADAS' | 'CANCELADO'>('CONFIRMADAS');
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);
  const [mesasCatalogo, setMesasCatalogo] = useState<MesaResponse[]>([]);
  const [clientesCatalogo, setClientesCatalogo] = useState<Cliente[]>([]);

  useEffect(() => {
    fetchReservas();
    fetchTransacciones();
    adminService.getMesas().then(setMesasCatalogo).catch(() => setMesasCatalogo([]));
    adminService.getClientes().then(setClientesCatalogo).catch(() => setClientesCatalogo([]));

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchReservas();
      fetchTransacciones();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredReservas = reservas.filter(r => {
    const matchesSearch = 
      (r.usuario?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.usuarioId || '').toString().includes(searchTerm) ||
      r.id.toString().includes(searchTerm);
    const isVerificada = Boolean(r.fechaVerificacionReserva || r.fechaHoraVerificacionReserva);
    const matchesEstado =
      (filterEstado === 'EXPIRADO' && r.estado === 'EXPIRADO') ||
      (filterEstado === 'ESPERANDO PAGO' && r.estado === 'ESPERANDO PAGO') ||
      (filterEstado === 'CONFIRMADAS' && r.estado === 'PAGADO' && !isVerificada) ||
      (filterEstado === 'VERIFICADAS' && isVerificada) ||
      (filterEstado === 'CANCELADO' && r.estado === 'CANCELADO');
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ESPERANDO PAGO': return <Badge className="bg-yellow-100 text-yellow-800">Esperando Pago</Badge>;
      case 'PAGADO': return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'CANCELADO': return <Badge variant="secondary">Cancelado</Badge>;
      case 'EXPIRADO': return <Badge variant="destructive">Expirado</Badge>;
      case 'NO_SHOW': return <Badge variant="destructive">No Show</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };
  const getEstadoBorderClass = (estado: string) => {
    switch (estado) {
      case 'ESPERANDO PAGO': return 'border-l-yellow-500';
      case 'PAGADO': return 'border-l-green-500';
      case 'CANCELADO': return 'border-l-slate-400';
      case 'EXPIRADO':
      case 'NO_SHOW': return 'border-l-red-500';
      default: return 'border-l-slate-300';
    }
  };

  const reservasHoy = reservas.filter(r => {
    const hoy = new Date().toISOString().split('T')[0];
    return r.fechaReserva === hoy;
  });

  const handleVerDetalle = async (id: number) => {
    setSelectedReservaId(id);
    await fetchReservaById(id);
  };

  const handleCancelar = async (id: number) => {
    try {
      await cancelarReserva(id);
      toast.success('Reserva cancelada correctamente.');
      await fetchReservas();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'No se pudo cancelar la reserva.');
    }
  };

  const handleVerificar = async (id: number) => {
    try {
      await verificarReserva(id);
      toast.success('Reserva verificada correctamente.');
      await fetchReservas();
      if (selectedReservaId === id) {
        await fetchReservaById(id);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'No se pudo verificar la reserva.');
    }
  };

  const getFechaHoraReserva = (reserva: any) =>
    new Date(`${reserva.fechaReserva}T${(reserva.horaReserva || '00:00:00').slice(0, 8)}`);

  const puedeVerificarLlegada = (reserva: any) => {
    if (reserva.estado !== 'PAGADO') return false;
    if (reserva.fechaVerificacionReserva || reserva.fechaHoraVerificacionReserva) return false;
    return new Date() >= getFechaHoraReserva(reserva);
  };

  const mesasDetalle = (reservaActual?.mesasIds || []).map((mesaId) => {
    const mesa = mesasCatalogo.find((m) => m.id === mesaId);
    return mesa ? `${mesa.nombre} (#${mesa.id})` : `Mesa #${mesaId}`;
  });

  const clienteDetalle =
    clientesCatalogo.find((cliente) => cliente.usuario?.id === reservaActual?.usuarioId) ||
    null;

  const formatLocalDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    if (!year || !month || !day) return isoDate;
    return new Date(year, month - 1, day).toLocaleDateString('es-PE');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-7 w-7" />
              Gestión de Reservas
            </h2>
            <p className="text-gray-500">Verifica y administra las reservas de los clientes</p>
          </div>
          {isLoading && <Badge variant="outline">Actualizando…</Badge>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Esperando Pago</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reservas.filter(r => r.estado === 'ESPERANDO PAGO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Confirmadas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reservas.filter(r => r.estado === 'PAGADO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Canceladas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reservas.filter(r => r.estado === 'CANCELADO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Reservas Hoy</p>
                  <p className="text-3xl font-bold text-gray-900">{reservasHoy.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Transacciones</p>
                  <p className="text-3xl font-bold text-gray-900">{transacciones.length}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar reserva por ID o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterEstado === 'EXPIRADO' ? 'default' : 'outline'}
              className={filterEstado === 'EXPIRADO' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setFilterEstado('EXPIRADO')}
            >
              Expiradas
            </Button>
            <Button
              variant={filterEstado === 'ESPERANDO PAGO' ? 'default' : 'outline'}
              className={filterEstado === 'ESPERANDO PAGO' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setFilterEstado('ESPERANDO PAGO')}
            >
              Esperando Pago
            </Button>
            <Button
              variant={filterEstado === 'CONFIRMADAS' ? 'default' : 'outline'}
              className={filterEstado === 'CONFIRMADAS' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setFilterEstado('CONFIRMADAS')}
            >
              Confirmadas
            </Button>
            <Button
              variant={filterEstado === 'VERIFICADAS' ? 'default' : 'outline'}
              className={filterEstado === 'VERIFICADAS' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setFilterEstado('VERIFICADAS')}
            >
              Verificadas
            </Button>
            <Button
              variant={filterEstado === 'CANCELADO' ? 'default' : 'outline'}
              className={filterEstado === 'CANCELADO' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setFilterEstado('CANCELADO')}
            >
              Canceladas
            </Button>
          </div>
        </div>

        {/* Reservas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservas.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron reservas</p>
            </div>
          ) : (
            filteredReservas.map((reserva) => (
              <Card key={reserva.id} className={`border-l-4 ${getEstadoBorderClass(reserva.estado)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Reserva #{reserva.id}</CardTitle>
                    {getEstadoBadge(reserva.estado)}
                  </div>
                    <p className="text-sm text-gray-500">
                    {reserva.usuario?.username || `Usuario #${reserva.usuarioId ?? '-'}`}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Fecha:</span>
                      <span className="font-medium">
                        {formatLocalDate(reserva.fechaReserva)}
                      </span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Hora:</span>
                      <span className="font-medium">{reserva.horaReserva}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Personas:</span>
                      <span className="font-medium">{reserva.numPersonas}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Grupo:</span>
                      <span className="font-medium">{reserva.grupo?.nombre || `#${reserva.grupoId ?? '-'}`}</span>
                    </div>
                    {reserva.fechaHoraExpiracionPago && reserva.estado === 'ESPERANDO PAGO' && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                        <span className="text-yellow-700">
                          Expira: {new Date(reserva.fechaHoraExpiracionPago).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleVerDetalle(reserva.id)}>
                        Ver detalle
                      </Button>
                      {(reserva.estado === 'ESPERANDO PAGO' || reserva.estado === 'PAGADO') && (
                        <Button variant="outline" size="sm" onClick={() => handleCancelar(reserva.id)}>
                          Cancelar
                        </Button>
                      )}
                      {puedeVerificarLlegada(reserva) && (
                        <Button size="sm" onClick={() => handleVerificar(reserva.id)}>
                          Verificar llegada
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalle de reserva</CardTitle>
          </CardHeader>
          <CardContent>
            {!reservaActual || !selectedReservaId ? (
              <p className="text-gray-500 text-sm">Selecciona una reserva para ver su información completa.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p><strong>ID:</strong> {reservaActual.id}</p>
                <p><strong>Estado:</strong> {reservaActual.estado}</p>
                <p><strong>Usuario:</strong> #{reservaActual.usuarioId ?? '-'}</p>
                <p><strong>Grupo:</strong> #{reservaActual.grupoId ?? '-'}</p>
                <p><strong>Mesas:</strong> {(reservaActual.mesasIds || []).join(', ') || '-'}</p>
                <p className="md:col-span-2"><strong>Mesas (nombres):</strong> {mesasDetalle.length > 0 ? mesasDetalle.join(', ') : '-'}</p>
                <p><strong>Personas:</strong> {reservaActual.numPersonas}</p>
                <p><strong>Fecha:</strong> {formatLocalDate(reservaActual.fechaReserva)}</p>
                <p><strong>Hora:</strong> {reservaActual.horaReserva}</p>
                <p><strong>Registro:</strong> {reservaActual.fechaRegistro ? new Date(reservaActual.fechaRegistro).toLocaleString() : '-'}</p>
                <p><strong>Verificación:</strong> {(reservaActual.fechaVerificacionReserva || reservaActual.fechaHoraVerificacionReserva) ? new Date((reservaActual.fechaVerificacionReserva || reservaActual.fechaHoraVerificacionReserva) as string).toLocaleString() : '-'}</p>
                <p><strong>Usuario verificador:</strong> {reservaActual.usuarioVerificadorId ?? '-'}</p>
                <p><strong>Cliente:</strong> {clienteDetalle ? `${clienteDetalle.nombre} ${clienteDetalle.apellido}` : '-'}</p>
                <p><strong>Correo cliente:</strong> {clienteDetalle?.correo || '-'}</p>
                <p><strong>DNI cliente:</strong> {(clienteDetalle as any)?.dni || 'No disponible'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas transacciones de reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {transacciones.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay transacciones registradas.</p>
            ) : (
              <div className="space-y-2">
                {transacciones.slice(0, 8).map((transaccion) => (
                  <div key={transaccion.id} className="flex items-center justify-between border rounded-md p-3 text-sm">
                    <div>
                       <p className="font-medium">Reserva #{transaccion.reservaId ?? transaccion.reserva?.id ?? '-'}</p>
                      <p className="text-gray-500">{transaccion.estadoMercadoPago}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">S/ {transaccion.monto.toFixed(2)}</p>
                      <p className="text-gray-500">{new Date(transaccion.fechaActualizacion).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RecepcionistaDashboard;