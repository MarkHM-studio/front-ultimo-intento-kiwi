import { useEffect, useState } from 'react';
import { usePedidoStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, CheckCircle, Utensils, AlertCircle } from 'lucide-react';

export const CocineroDashboard: React.FC = () => {
  const { pedidos, fetchPedidos, marcarPreparando, marcarListo, isLoading } = usePedidoStore();
  const [activeTab, setActiveTab] = useState<'pendientes' | 'preparando' | 'todos'>('pendientes');

  useEffect(() => {
    fetchPedidos();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(() => {
      fetchPedidos();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const pedidosCocina = pedidos;

  const pedidosPendientesCocina = pedidosCocina.filter(p => p.estado === 'PENDIENTE');
  const pedidosPreparandoCocina = pedidosCocina.filter(p => p.estado === 'PREPARANDO');

  const handleMarcarPreparando = async (pedidoId: number) => {
    try {
      await marcarPreparando(pedidoId);
    } catch (error) {
      console.error('Error marcando como preparando:', error);
    }
  };

  const handleMarcarListo = async (pedidoId: number) => {
    try {
      await marcarListo(pedidoId);
    } catch (error) {
      console.error('Error marcando como listo:', error);
    }
  };

  const getPedidosToShow = () => {
    switch (activeTab) {
      case 'pendientes': return pedidosPendientesCocina;
      case 'preparando': return pedidosPreparandoCocina;
      case 'todos': return pedidosCocina;
      default: return pedidosPendientesCocina;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return <Badge variant="outline" className="text-gray-500 border-gray-300">Pendiente</Badge>;
      case 'PREPARANDO': return <Badge className="bg-yellow-100 text-yellow-800">Preparando</Badge>;
      case 'LISTO': return <Badge className="bg-green-100 text-green-800">Listo</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };

  const getTipoEntregaBadge = (tipo: any) => {
    const tipoStr = typeof tipo === 'string' ? tipo : tipo.nombre;
    if (tipoStr === 'COMER') return <Badge variant="outline" className="text-blue-600 border-blue-300">Comer</Badge>;
    return <Badge variant="outline" className="text-orange-600 border-orange-300">Llevar</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ChefHat className="h-7 w-7" />
              Cocina
            </h2>
            <p className="text-gray-500">Gestiona los pedidos de la cocina</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => fetchPedidos()}
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900">{pedidosPendientesCocina.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Preparando</p>
                  <p className="text-3xl font-bold text-gray-900">{pedidosPreparandoCocina.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Listos Hoy</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pedidosCocina.filter(p => p.estado === 'LISTO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'pendientes' ? 'default' : 'outline'}
            className={activeTab === 'pendientes' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            onClick={() => setActiveTab('pendientes')}
          >
            Pendientes ({pedidosPendientesCocina.length})
          </Button>
          <Button
            variant={activeTab === 'preparando' ? 'default' : 'outline'}
            className={activeTab === 'preparando' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            onClick={() => setActiveTab('preparando')}
          >
            Preparando ({pedidosPreparandoCocina.length})
          </Button>
          <Button
            variant={activeTab === 'todos' ? 'default' : 'outline'}
            className={activeTab === 'todos' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            onClick={() => setActiveTab('todos')}
          >
            Todos
          </Button>
        </div>

        {/* Pedidos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getPedidosToShow().length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay pedidos {activeTab}</p>
            </div>
          ) : (
            getPedidosToShow().map((pedido) => (
              <Card key={pedido.id} className={`${pedido.estado === 'PENDIENTE' ? 'border-yellow-400' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pedido.producto?.nombre || `Producto #${pedido.productoId ?? pedido.id}`}</CardTitle>
                    {getEstadoBadge(pedido.estado)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getTipoEntregaBadge(pedido.tipoEntrega)}
                    <span className="text-sm text-gray-500">x{pedido.cantidad}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Comprobante:</span>
                      <span className="font-medium">#{pedido.comprobante?.id ?? pedido.comprobanteId ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Hora:</span>
                      <span className="font-medium">
                        {new Date(pedido.fechaHoraRegistro || pedido.fechaRegistro || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Mozo:</span>
                      <span className="font-medium">{pedido.usuario?.username || `Mozo #${pedido.usuarioId ?? '-'}`}</span>
                    </div>
                    
                    {pedido.estado === 'PENDIENTE' && (
                      <Button 
                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                        onClick={() => handleMarcarPreparando(pedido.id)}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Iniciar Preparación
                      </Button>
                    )}
                    
                    {pedido.estado === 'PREPARANDO' && (
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => handleMarcarListo(pedido.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar Listo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CocineroDashboard;
