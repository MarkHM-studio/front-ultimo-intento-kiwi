import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useAlmacenStore, useAuthStore } from '@/stores';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Package, Warehouse, TrendingUp, ArrowDownLeft } from 'lucide-react';
import type { EntradaRequest } from '@/types';
import { toast } from 'sonner';

export const AlmaceneroDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    entradas, 
    insumos, 
    productos, 
    proveedores,
    fetchEntradas, 
    fetchInsumos, 
    fetchProductos,
    fetchProveedores,
    createEntrada,
    isLoading 
  } = useAlmacenStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipoEntrada, setTipoEntrada] = useState<'producto' | 'insumo'>('insumo');
  const [formData, setFormData] = useState<EntradaRequest>({
    cantidadTotal: 0,
    unidadMedida: '',
    costoUnitario: 0,
    productoId: undefined,
    insumoId: undefined,
    proveedorId: 0,
    usuarioId: user?.usuarioId || 0
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchEntradas();
    fetchInsumos();
    fetchProductos();
    fetchProveedores();
  }, []);

   const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
      const backendMessage = (error.response?.data as { message?: string } | undefined)?.message;
      return backendMessage || fallback;
    }
    return fallback;
  };

  const handleChangeTipoEntrada = (tipo: 'producto' | 'insumo') => {
    setTipoEntrada(tipo);
    setFormData((prev) => ({
      ...prev,
      productoId: undefined,
      insumoId: undefined,
      unidadMedida: tipo === 'producto' ? 'UDS' : '',
    }));
  };


   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.proveedorId) return setFormError('Selecciona un proveedor.');
    if (tipoEntrada === 'insumo' && !formData.insumoId) return setFormError('Selecciona un insumo.');
    if (tipoEntrada === 'producto' && !formData.productoId) return setFormError('Selecciona un producto.');
    if (!formData.unidadMedida.trim()) return setFormError('La unidad de medida es obligatoria.');
    if (formData.cantidadTotal <= 0 || formData.costoUnitario <= 0) {
      return setFormError('Cantidad y costo unitario deben ser mayores a 0.');
    }
    try {
      await createEntrada({
        ...formData,
        usuarioId: user?.usuarioId || 0
      });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Entrada registrada correctamente.');
    } catch (error) {
      const message = getErrorMessage(error, 'No se pudo registrar la entrada.');
      setFormError(message);
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      cantidadTotal: 0,
      unidadMedida: tipoEntrada === 'producto' ? 'UDS' : '',
      costoUnitario: 0,
      productoId: undefined,
      insumoId: undefined,
      proveedorId: 0,
      usuarioId: user?.usuarioId || 0
    });
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 5) return <Badge variant="destructive">{stock}</Badge>;
    if (stock <= 15) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{stock}</Badge>;
    return <Badge className="bg-green-100 text-green-800">{stock}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Warehouse className="h-7 w-7" />
              Almacén
            </h2>
            <p className="text-gray-500">Gestiona las entradas de inventario</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Entrada</DialogTitle>
                <DialogDescription>
                 Registra una nueva entrada de producto o insumo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    {formError && <p className="text-sm text-red-600">{formError}</p>}
                    <Label>Tipo de Entrada</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={tipoEntrada === 'insumo' ? 'default' : 'outline'}
                        className={tipoEntrada === 'insumo' ? 'bg-amber-600' : ''}
                        onClick={() => handleChangeTipoEntrada('insumo')}
                      >
                        Insumo
                      </Button>
                      <Button
                        type="button"
                        variant={tipoEntrada === 'producto' ? 'default' : 'outline'}
                        className={tipoEntrada === 'producto' ? 'bg-amber-600' : ''}
                        onClick={() => handleChangeTipoEntrada('producto')}
                      >
                        Producto
                      </Button>
                    </div>
                  </div>

                  {tipoEntrada === 'insumo' ? (
                    <div className="space-y-2">
                      <Label>Insumo</Label>
                      <Select 
                        value={formData.insumoId?.toString() || ''} 
                        onValueChange={(value) => {
                          const selectedInsumo = insumos.find((i) => i.id === parseInt(value));
                          setFormData({
                            ...formData,
                            insumoId: parseInt(value),
                            productoId: undefined,
                            unidadMedida: selectedInsumo?.unidadMedida || ''
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un insumo" />
                        </SelectTrigger>
                        <SelectContent>
                          {insumos.map((i) => (
                            <SelectItem key={i.id} value={i.id.toString()}>
                              {i.nombre} (Stock: {i.stock} {i.unidadMedida})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Producto</Label>
                      <Select 
                        value={formData.productoId?.toString() || ''} 
                        onValueChange={(value) => setFormData({ ...formData, productoId: parseInt(value), insumoId: undefined, unidadMedida: 'UDS' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                        <SelectContent>
                           {productos.filter(p => ![1, 2].includes(p.categoria.id)).map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.nombre} (Stock: {p.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Proveedor</Label>
                    <Select 
                      value={formData.proveedorId.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, proveedorId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {proveedores.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.razonSocial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cantidadTotal}
                        onChange={(e) => setFormData({ ...formData, cantidadTotal: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                       <Label>Unidad de Medida</Label>
                      <Input
                        value={formData.unidadMedida}
                        disabled
                        placeholder="KG, L, UDS..."
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Costo Unitario (S/)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costoUnitario}
                      onChange={(e) => setFormData({ ...formData, costoUnitario: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Costo Total: <span className="font-bold">S/ {(formData.cantidadTotal * formData.costoUnitario).toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Registrar Entrada'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Insumos</p>
                  <p className="text-3xl font-bold text-gray-900">{insumos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Entradas Hoy</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {entradas.filter(e => {
                      const hoy = new Date().toISOString().split('T')[0];
                      return (e.fechaRegistro || e.fechaHoraRegistro || '').startsWith(hoy);
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowDownLeft className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {insumos.filter(i => i.stock <= 5).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Proveedores</p>
                  <p className="text-3xl font-bold text-gray-900">{proveedores.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Warehouse className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insumos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock de Insumos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {insumos.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay insumos registrados</p>
                ) : (
                  insumos.map((insumo) => (
                    <div key={insumo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{insumo.nombre}</p>
                        <p className="text-sm text-gray-500">
                          S/ {insumo.precio.toFixed(2)} / {insumo.unidadMedida}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStockBadge(insumo.stock)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Entradas Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5" />
                Entradas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {entradas.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay entradas registradas</p>
                ) : (
                  entradas.slice(0, 10).map((entrada) => (
                    <div key={entrada.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {entrada.producto?.nombre || entrada.insumo?.nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            {entrada.proveedor?.razonSocial || `Proveedor #${entrada.proveedorId ?? '-'}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">+{entrada.cantidadTotal} {entrada.unidadMedida}</p>
                          <p className="text-sm text-gray-500">
                            S/ {entrada.costoTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(entrada.fechaRegistro || entrada.fechaHoraRegistro || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AlmaceneroDashboard;
