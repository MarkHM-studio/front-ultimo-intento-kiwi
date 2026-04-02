import { useEffect, useState } from 'react';
import { useReservaStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, CheckCircle, Clock, Users, Search, XCircle } from 'lucide-react';

export const RecepcionistaDashboard: React.FC = () => {
  const { reservas, transacciones, fetchReservas, fetchTransacciones, isLoading } = useReservaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  useEffect(() => {
    fetchReservas();
    fetchTransacciones();
    
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
    const matchesEstado = filterEstado === 'todos' || r.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ESPERANDO PAGO': return <Badge className="bg-yellow-100 text-yellow-800">Esperando Pago</Badge>;
      case 'PAGADO': return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'CANCELADO': return <Badge variant="secondary">Cancelado</Badge>;
      case 'EXPIRADO': return <Badge variant="destructive">Expirado</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };

  const reservasHoy = reservas.filter(r => {
    const hoy = new Date().toISOString().split('T')[0];
    return r.fechaReserva === hoy;
  });

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
          <Button 
            variant="outline" 
            onClick={() => fetchReservas()}
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
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
              variant={filterEstado === 'todos' ? 'default' : 'outline'}
              className={filterEstado === 'todos' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setFilterEstado('todos')}
            >
              Todos
            </Button>
            <Button
              variant={filterEstado === 'ESPERANDO PAGO' ? 'default' : 'outline'}
              className={filterEstado === 'ESPERANDO PAGO' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setFilterEstado('ESPERANDO PAGO')}
            >
              Pendientes
            </Button>
            <Button
              variant={filterEstado === 'PAGADO' ? 'default' : 'outline'}
              className={filterEstado === 'PAGADO' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setFilterEstado('PAGADO')}
            >
              Confirmadas
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
              <Card key={reserva.id}>
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
                        {new Date(reserva.fechaReserva).toLocaleDateString()}
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
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

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