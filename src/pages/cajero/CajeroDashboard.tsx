import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useComprobanteStore, useAuthStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, FileText, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import type { TipoComprobante, TipoPago, TipoBilleteraVirtual } from '@/types';
import { toast } from 'sonner';
import { comprobanteService } from '@/services/comprobanteService';

export const CajeroDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { comprobantes, pedidosComprobante, fetchComprobantes, fetchPedidosByComprobante, registrarVenta } = useComprobanteStore();
  
  const [selectedComprobante, setSelectedComprobante] = useState<number | null>(null);
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false);
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('BOLETA');
  const [tipoPago, setTipoPago] = useState<TipoPago>('EFECTIVO');
  const [billetera, setBilletera] = useState<TipoBilleteraVirtual>('YAPE');
  const [documento, setDocumento] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [mensajePago, setMensajePago] = useState('');

  useEffect(() => {
    fetchComprobantes();
  }, []);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
      const backendMessage = (error.response?.data as { message?: string } | undefined)?.message;
      return backendMessage || fallback;
    }
    return fallback;
  };

  const comprobantesAbiertos = comprobantes.filter(c => c.estado === 'ABIERTO');

  const handleVerComprobante = async (comprobanteId: number) => {
    const comprobante = comprobantes.find(c => c.id === comprobanteId);
    if (!comprobante) return;
    if ((comprobante.total || 0) <= 0) {
      toast.error('No se puede procesar un comprobante con total 0.');
      return;
    }

    const pedidos = await comprobanteService.getPedidosByComprobante(comprobanteId);
    if (pedidos.length === 0) {
      toast.error('No se puede registrar venta de un comprobante sin pedidos.');
      return;
    }

    setSelectedComprobante(comprobanteId);
    await fetchPedidosByComprobante(comprobanteId);
    setIsPagoDialogOpen(true);
  };

  const handlePagar = async () => {
    if (!selectedComprobante) return;
    
    const comprobante = comprobantes.find(c => c.id === selectedComprobante);
    if (!comprobante) return;
    if ((comprobante.total || 0) <= 0) {
      toast.error('No se puede procesar un comprobante con total 0.');
      return;
    }
    if (pedidosComprobante.length === 0) {
      toast.error('No se puede registrar venta de un comprobante sin pedidos.');
      return;
    }

    try {
      const tipoPagoId = [tipoPago === 'EFECTIVO' ? 1 : 2];
      const montoEfectivo = parseFloat(montoRecibido || '0');

      if (tipoPago === 'EFECTIVO') {
        if (!montoRecibido || Number.isNaN(montoEfectivo) || montoEfectivo <= 0) {
          toast.error('Debes ingresar un monto recibido válido para efectivo.');
          return;
        }
      }

      const montos: number[] = [tipoPago === 'EFECTIVO' ? montoEfectivo : comprobante.total];

      const mensaje = await registrarVenta({
        usuarioId: user?.usuarioId || 0,
        comprobanteId: selectedComprobante,
        tipoPagoId,
        montos,
        tipoBilleteraVirtualId: tipoPago === 'BILLETERA VIRTUAL' ? (billetera === 'YAPE' ? 1 : 2) : undefined,
        tipoComprobante,
        dni: tipoComprobante === 'BOLETA' ? documento : undefined,
        ruc: tipoComprobante === 'FACTURA' ? documento : undefined,
        sucursalId: 1
      });

      setMensajePago(mensaje);
      setPagoExitoso(true);
      toast.success(mensaje || 'Pago registrado correctamente.');
      
      setTimeout(() => {
        setIsPagoDialogOpen(false);
        setPagoExitoso(false);
        setMensajePago('');
        setSelectedComprobante(null);
        setDocumento('');
        setMontoRecibido('');
      }, 3000);
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo registrar la venta.'));
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-7 w-7" />
              Caja
            </h2>
            <p className="text-gray-500">Gestiona los pagos de los comprobantes</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Comprobantes Abiertos</p>
                  <p className="text-3xl font-bold text-gray-900">{comprobantesAbiertos.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total por Cobrar</p>
                  <p className="text-3xl font-bold text-gray-900">
                    S/ {comprobantesAbiertos.reduce((sum, c) => sum + c.total, 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ventas Hoy</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {comprobantes.filter(c => c.estado === 'PAGADO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comprobantes Abiertos */}
             <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Comprobantes por Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comprobantesAbiertos.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No hay comprobantes pendientes de pago</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comprobantesAbiertos.map((comprobante) => (
                  <Card key={comprobante.id} className="border-2 border-amber-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Comprobante #{comprobante.id}</CardTitle>
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          {comprobante.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(comprobante.fechaHoraApertura || comprobante.fechaHora_apertura || Date.now()).toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Subtotal:</span>
                          <span>S/ {(comprobante.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">IGV:</span>
                          <span>S/ {(comprobante.igv || comprobante.IGV || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-amber-600">S/ {comprobante.total.toFixed(2)}</span>
                        </div>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 mt-4"
                          onClick={() => handleVerComprobante(comprobante.id)}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Procesar Pago
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Pago */}
        <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
          <DialogContent className="max-w-2xl">
            {pagoExitoso ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h3>
                <p className="text-gray-600">{mensajePago}</p>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Procesar Pago</DialogTitle>
                  <DialogDescription>
                    Completa los datos para registrar el pago
                  </DialogDescription>
                </DialogHeader>

                {selectedComprobante && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500">Comprobante:</span>
                      <span className="font-medium">#{selectedComprobante}</span>
                    </div>
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total a Pagar:</span>
                      <span className="text-amber-600">
                        S/ {comprobantes.find(c => c.id === selectedComprobante)?.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                 {/* Pedidos del comprobante */}
                {pedidosComprobante.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Detalle de Pedidos:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Cant.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pedidosComprobante.map((pedido) => (
                          <TableRow key={pedido.id}>
                            <TableCell>{pedido.producto?.nombre || `Producto #${pedido.id}`}</TableCell>
                            <TableCell className="text-right">x{pedido.cantidad}</TableCell>
                            <TableCell className="text-right">S/ {pedido.subtotal.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Tipo de Comprobante */}
                  <div>
                    <Label className="mb-2 block">Tipo de Comprobante</Label>
                    <RadioGroup 
                      value={tipoComprobante} 
                      onValueChange={(value) => setTipoComprobante(value as TipoComprobante)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="BOLETA" id="boleta" />
                        <Label htmlFor="boleta">Boleta</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="FACTURA" id="factura" />
                        <Label htmlFor="factura">Factura</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Documento */}
                  <div>
                    <Label htmlFor="documento">
                      {tipoComprobante === 'BOLETA' ? 'DNI' : 'RUC'}
                    </Label>
                    <Input
                      id="documento"
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                      placeholder={tipoComprobante === 'BOLETA' ? '12345678' : '12345678901'}
                      maxLength={tipoComprobante === 'BOLETA' ? 8 : 11}
                    />
                  </div>

                  {/* Tipo de Pago */}
                  <div>
                    <Label className="mb-2 block">Método de Pago</Label>
                    <RadioGroup 
                      value={tipoPago} 
                      onValueChange={(value) => setTipoPago(value as TipoPago)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="EFECTIVO" id="efectivo" />
                        <Label htmlFor="efectivo" className="flex items-center gap-1">
                          <Banknote className="h-4 w-4" />
                          Efectivo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="BILLETERA VIRTUAL" id="billetera" />
                        <Label htmlFor="billetera" className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          Billetera Virtual
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Billetera Virtual */}
                  {tipoPago === 'BILLETERA VIRTUAL' && (
                    <div>
                      <Label className="mb-2 block">Selecciona la Billetera</Label>
                      <RadioGroup 
                        value={billetera} 
                        onValueChange={(value) => setBilletera(value as TipoBilleteraVirtual)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="YAPE" id="yape" />
                          <Label htmlFor="yape">Yape</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PLIN" id="plin" />
                          <Label htmlFor="plin">Plin</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Monto Recibido (solo efectivo) */}
                  {tipoPago === 'EFECTIVO' && (
                    <div>
                      <Label htmlFor="montoRecibido">Monto Recibido</Label>
                      <Input
                        id="montoRecibido"
                        type="number"
                        step="0.01"
                        value={montoRecibido}
                        onChange={(e) => setMontoRecibido(e.target.value)}
                        placeholder="0.00"
                      />
                      {selectedComprobante && montoRecibido && (
                        <p className="text-sm text-gray-500 mt-1">
                          Vuelto: S/ {(parseFloat(montoRecibido) - (comprobantes.find(c => c.id === selectedComprobante)?.total || 0)).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPagoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handlePagar}
                    disabled={tipoComprobante === 'BOLETA' ? documento.length !== 8 : documento.length !== 11}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar Pago
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CajeroDashboard;
