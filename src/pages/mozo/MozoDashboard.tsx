import { useEffect, useState } from 'react';
import { useComprobanteStore, usePedidoStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ShoppingCart, Edit, CheckCircle, Users, Table as TableIcon } from 'lucide-react';
import type { PedidoRequest } from '@/types';
import { useAuthStore } from '@/stores';

export const MozoDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    comprobantes, 
    fetchComprobantes, 
    createComprobante,
    asignarMesas,
    fetchPedidosByComprobante,
    pedidosComprobante,
    mesasOcupadas,
    fetchMesasOcupadas
  } = useComprobanteStore();
  const { createPedido, updatePedido } = usePedidoStore();
  
  const [isNuevoComprobanteOpen, setIsNuevoComprobanteOpen] = useState(false);
  const [isNuevoPedidoOpen, setIsNuevoPedidoOpen] = useState(false);
  const [isEditarPedidoOpen, setIsEditarPedidoOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<number | null>(null);
  const [editingPedido, setEditingPedido] = useState<number | null>(null);
  const [isAsignarMesasOpen, setIsAsignarMesasOpen] = useState(false);
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState<number[]>([]);
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [formData, setFormData] = useState<PedidoRequest>({
    cantidad: 1,
    comprobanteId: 0,
    productoId: 0,
    tipoEntregaId: 1,
    usuarioId: user?.usuarioId || 0
  });

  useEffect(() => {
    fetchComprobantes();
    fetchMesasOcupadas();
  }, []);

  const comprobantesAbiertos = comprobantes.filter(c => c.estado === 'ABIERTO');

  const handleCrearComprobante = async () => {
    try {
      await createComprobante({ sucursalId: 1 }); // Default sucursal
      setIsNuevoComprobanteOpen(false);
    } catch (error) {
      console.error('Error creating comprobante:', error);
    }
  };

  const handleVerComprobante = async (comprobanteId: number) => {
    setSelectedComprobante(comprobanteId);
    await fetchPedidosByComprobante(comprobanteId);
  };

  const handleCrearPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComprobante) return;
    
    try {
      await createPedido({
        ...formData,
        comprobanteId: selectedComprobante,
        usuarioId: user?.usuarioId || 0
      });
      setIsNuevoPedidoOpen(false);
      setFormData({
        cantidad: 1,
        comprobanteId: 0,
        productoId: 0,
        tipoEntregaId: 1,
        usuarioId: user?.usuarioId || 0
      });
      await fetchPedidosByComprobante(selectedComprobante);
      fetchComprobantes();
    } catch (error) {
      console.error('Error creating pedido:', error);
    }
  };

  const handleEditarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPedido || !selectedComprobante) return;
    
    try {
      await updatePedido(editingPedido, {
        ...formData,
        comprobanteId: selectedComprobante,
        usuarioId: user?.usuarioId || 0
      });
      setIsEditarPedidoOpen(false);
      setEditingPedido(null);
      await fetchPedidosByComprobante(selectedComprobante);
      fetchComprobantes();
    } catch (error) {
      console.error('Error updating pedido:', error);
    }
  };

  const openEditPedido = (pedido: typeof pedidosComprobante[0]) => {
    setEditingPedido(pedido.id);
    setFormData({
      cantidad: pedido.cantidad,
      comprobanteId: selectedComprobante || 0,
      productoId: pedido.producto?.id || 0,
      tipoEntregaId: (pedido.tipoEntregaResponse?.id || pedido.tipoEntrega?.id || 1),
      usuarioId: user?.usuarioId || 0
    });
    setIsEditarPedidoOpen(true);
  };

  const getTipoEntregaBadge = (tipo: any) => {
    const tipoStr = typeof tipo === 'string' ? tipo : tipo?.nombre || 'COMER';
    if (tipoStr === 'COMER') return <Badge className="bg-blue-100 text-blue-800">Para Comer</Badge>;
    return <Badge className="bg-orange-100 text-orange-800">Para Llevar</Badge>;
  };

  const handleAsignarMesas = async () => {
    if (!selectedComprobante || mesasSeleccionadas.length === 0) return;
    try {
      await asignarMesas({
        comprobanteId: selectedComprobante,
        mesasId: mesasSeleccionadas,
        nombreGrupo
      });
      setIsAsignarMesasOpen(false);
      setMesasSeleccionadas([]);
      setNombreGrupo('');
      fetchComprobantes();
      fetchMesasOcupadas();
    } catch (error) {
      console.error('Error asignando mesas:', error);
    }
  };

  const toggleMesa = (id: number) => {
    setMesasSeleccionadas(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return <Badge variant="outline" className="text-gray-500">Pendiente</Badge>;
      case 'PREPARANDO': return <Badge className="bg-yellow-100 text-yellow-800">Preparando</Badge>;
      case 'LISTO': return <Badge className="bg-green-100 text-green-800">Listo</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h2>
            <p className="text-gray-500">Crea comprobantes y administra pedidos</p>
          </div>
          <Button 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => setIsNuevoComprobanteOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Comprobante
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Comprobantes Abiertos</p>
                  <p className="text-2xl font-bold text-gray-900">{comprobantesAbiertos.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Mesas Ocupadas</p>
                  <p className="text-2xl font-bold text-gray-900">{mesasOcupadas.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TableIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pedidos Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pedidosComprobante.filter(p => p.estado === 'PENDIENTE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comprobantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Comprobantes Abiertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comprobantesAbiertos.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay comprobantes abiertos</p>
                ) : (
                  comprobantesAbiertos.map((comprobante) => (
                    <div
                      key={comprobante.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedComprobante === comprobante.id 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleVerComprobante(comprobante.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Comprobante #{comprobante.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(comprobante.fechaHoraApertura || comprobante.fechaHora_apertura || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">S/ {(comprobante.total || 0).toFixed(2)}</p>
                          <Badge variant="outline">{comprobante.estado}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pedidos del comprobante seleccionado */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Pedidos {selectedComprobante && `#${selectedComprobante}`}
                </CardTitle>
                {selectedComprobante && (
                   <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsAsignarMesasOpen(true)}
                    >
                      Asignar Mesas
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => setIsNuevoPedidoOpen(true)}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedComprobante ? (
                <p className="text-center text-gray-500 py-4">Selecciona un comprobante para ver sus pedidos</p>
              ) : pedidosComprobante.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay pedidos en este comprobante</p>
              ) : (
                <div className="space-y-2">
                  {pedidosComprobante.map((pedido) => (
                    <div key={pedido.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{pedido.producto?.nombre || `Producto #${pedido.id}`}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getTipoEntregaBadge(pedido.tipoEntregaResponse || pedido.tipoEntrega)}
                            {getEstadoBadge(pedido.estado)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">x{pedido.cantidad}</p>
                          <p className="text-sm text-gray-500">S/ {pedido.subtotal.toFixed(2)}</p>
                          <div className="flex gap-1 mt-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => openEditPedido(pedido)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog Nuevo Comprobante */}
        <Dialog open={isNuevoComprobanteOpen} onOpenChange={setIsNuevoComprobanteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Comprobante</DialogTitle>
              <DialogDescription>
                ¿Deseas crear un nuevo comprobante?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNuevoComprobanteOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleCrearComprobante}>
                Crear Comprobante
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

         {/* Dialog Nuevo Pedido */}
        <Dialog open={isNuevoPedidoOpen} onOpenChange={setIsNuevoPedidoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Pedido</DialogTitle>
              <DialogDescription>
                Selecciona el producto y la cantidad
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCrearPedido}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Producto ID</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.productoId || ''}
                    onChange={(e) => setFormData({ ...formData, productoId: parseInt(e.target.value) || 0 })}
                    placeholder="Ejemplo: 15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Entrega</Label>
                  <Select 
                    value={formData.tipoEntregaId.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, tipoEntregaId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de entrega" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Para Comer</SelectItem>
                      <SelectItem value="2">Para Llevar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNuevoPedidoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  Agregar Pedido
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Pedido */}
        <Dialog open={isEditarPedidoOpen} onOpenChange={setIsEditarPedidoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Pedido</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditarPedido}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Producto ID</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.productoId || ''}
                    onChange={(e) => setFormData({ ...formData, productoId: parseInt(e.target.value) || 0 })}
                    placeholder="Ejemplo: 15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Entrega</Label>
                  <Select 
                    value={formData.tipoEntregaId.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, tipoEntregaId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de entrega" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Para Comer</SelectItem>
                      <SelectItem value="2">Para Llevar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditarPedidoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  Actualizar Pedido
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isAsignarMesasOpen} onOpenChange={setIsAsignarMesasOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar mesas al comprobante</DialogTitle>
              <DialogDescription>Solo mesas no ocupadas se pueden asignar.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de grupo (opcional)</Label>
                <Input value={nombreGrupo} onChange={(e) => setNombreGrupo(e.target.value)} placeholder="Grupo Cumpleaños" />
              </div>
              <div className="space-y-2">
                <Label>Mesas ocupadas actualmente</Label>
                <div className="text-xs text-gray-500">
                  {mesasOcupadas.length === 0 ? 'No hay mesas ocupadas.' : mesasOcupadas.map(m => m.nombre || m.mesaNombre || `Mesa ${m.mesaId}`).join(', ')}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mesas a asignar</Label>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 20 }, (_, idx) => idx + 1).map((mesaId) => {
                    const ocupada = mesasOcupadas.some(m => m.mesaId === mesaId);
                    return (
                      <button
                        key={mesaId}
                        type="button"
                        onClick={() => !ocupada && toggleMesa(mesaId)}
                        disabled={ocupada}
                        className={`rounded border p-2 text-sm ${ocupada ? 'bg-gray-100 text-gray-400' : mesasSeleccionadas.includes(mesaId) ? 'bg-amber-600 text-white' : ''}`}
                      >
                        M{mesaId}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAsignarMesasOpen(false)}>Cancelar</Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleAsignarMesas} disabled={!selectedComprobante || mesasSeleccionadas.length === 0}>
                Asignar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default MozoDashboard;