import { useEffect, useState } from 'react';
import { useReservaStore, useAuthStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Calendar, Clock, Users, Plus, CreditCard, CheckCircle, XCircle } from 'lucide-react';

const HORARIOS = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

export const ClienteDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    reservasUsuario, 
    mesasDisponibles,
    preferenciaPago,
    fetchReservasByUsuario,
    fetchMesasDisponibles,
    createReserva,
    updateReserva,
    cancelarReserva,
    crearPreferenciaPago,
    clearPreferenciaPago
  } = useReservaStore();
  
  const [isNuevaReservaOpen, setIsNuevaReservaOpen] = useState(false);
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState<number[]>([]);
  const [numPersonas, setNumPersonas] = useState(2);
  const [editReservaId, setEditReservaId] = useState<number | null>(null);
  const [detalleReserva, setDetalleReserva] = useState<typeof reservasUsuario[number] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const toLocalDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayLocal = toLocalDateInput(new Date());
  const maxReservaDate = toLocalDateInput(new Date(new Date().setDate(new Date().getDate() + 7)));
  const formatLocalDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    if (!year || !month || !day) return isoDate;
    return new Date(year, month - 1, day).toLocaleDateString('es-PE');
  };

  useEffect(() => {
    fetchReservasByUsuario();
  }, []);

  useEffect(() => {
    if (fecha && hora) {
      fetchMesasDisponibles(fecha, hora);
    }
  }, [fecha, hora]);

  const handleCrearReserva = async () => {
    if (!user) return;
    setErrorMessage('');
    if (!fecha || !hora) return setErrorMessage('Selecciona fecha y hora.');
    if (mesasSeleccionadas.length === 0) return setErrorMessage('Selecciona al menos una mesa.');
    if (numPersonas < 1 || numPersonas > 20) return setErrorMessage('El número de personas debe estar entre 1 y 20.');
    
    try {
      const payload = {
        fechaReserva: fecha,
        horaReserva: hora,
        numPersonas,
        usuarioId: user.usuarioId,
        mesasId: mesasSeleccionadas,
        sucursalId: 1
      };
      const reserva = editReservaId
        ? await updateReserva(editReservaId, payload)
        : await createReserva(payload);
      
      setIsNuevaReservaOpen(false);
      setEditReservaId(null);
      fetchReservasByUsuario();
      
      if (reserva.estado === 'ESPERANDO PAGO') {
        await crearPreferenciaPago({
          reservaId: reserva.id,
          descripcion: `Reserva en La Pituca - ${fecha} ${hora}`,
          monto: 50
        });
        setAceptaTerminos(false);
        setIsPagoDialogOpen(true);
      }
    } catch (error) {
      console.error('Error creating reserva:', error);
    }
  };

  const handleCancelarReserva = async (reservaId: number) => {
    if (confirm('¿Estás seguro de cancelar esta reserva?')) {
      try {
        await cancelarReserva(reservaId);
        fetchReservasByUsuario();
      } catch (error) {
        console.error('Error cancelando reserva:', error);
      }
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ESPERANDO PAGO': return <Badge className="bg-yellow-100 text-yellow-800">Esperando Pago</Badge>;
      case 'PAGADO': return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>;
      case 'CANCELADO': return <Badge variant="secondary">Cancelada</Badge>;
      case 'EXPIRADO': return <Badge variant="destructive">Expirada</Badge>;
      case 'NO_SHOW': return <Badge variant="destructive">No Show</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };

   const toggleMesa = (mesaId: number) => {
    if (mesasSeleccionadas.includes(mesaId)) {
      setMesasSeleccionadas(mesasSeleccionadas.filter(id => id !== mesaId));
    } else {
      setMesasSeleccionadas([...mesasSeleccionadas, mesaId]);
    }
  };

  const isMesaOcupada = (mesa: typeof mesasDisponibles[number]) => mesa.ocupada || mesa.estado === 'OCUPADO';

   return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mis Reservas</h2>
            <p className="text-gray-500">Gestiona tus reservas en La Pituca</p>
          </div>
          <Button 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => {
              setEditReservaId(null);
              setErrorMessage('');
              setFecha('');
              setHora('');
              setMesasSeleccionadas([]);
              setNumPersonas(2);
              setIsNuevaReservaOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Reservas</p>
                  <p className="text-3xl font-bold text-gray-900">{reservasUsuario.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Confirmadas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reservasUsuario.filter(r => r.estado === 'PAGADO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reservasUsuario.filter(r => r.estado === 'ESPERANDO PAGO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Canceladas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reservasUsuario.filter(r => r.estado === 'CANCELADO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservasUsuario.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No tienes reservas aún</p>
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => setIsNuevaReservaOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Hacer tu primera reserva
              </Button>
            </div>
          ) : (
            reservasUsuario.map((reserva) => (
              <Card key={reserva.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Reserva #{reserva.id}</CardTitle>
                    {getEstadoBadge(reserva.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Fecha:
                      </span>
                      <span className="font-medium">
                        {formatLocalDate(reserva.fechaReserva)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Hora:
                      </span>
                      <span className="font-medium">{reserva.horaReserva}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Personas:
                      </span>
                      <span className="font-medium">{reserva.numPersonas}</span>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setDetalleReserva(reserva)}
                    >
                      Ver detalle
                    </Button>

                    {reserva.estado === 'ESPERANDO PAGO' && (
                      <div className="mt-4 space-y-2">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={async () => {
                            await crearPreferenciaPago({
                              reservaId: reserva.id,
                              descripcion: `Reserva en La Pituca - ${reserva.fechaReserva} ${reserva.horaReserva}`,
                              monto: 50
                            });
                            setAceptaTerminos(false);
                            setIsPagoDialogOpen(true);
                          }}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pagar Ahora
                        </Button>
                          <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setEditReservaId(reserva.id);
                            setFecha(reserva.fechaReserva);
                            setHora(reserva.horaReserva);
                            setNumPersonas(reserva.numPersonas);
                            setMesasSeleccionadas(reserva.mesasIds || []);
                            setErrorMessage('');
                            setIsNuevaReservaOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => handleCancelarReserva(reserva.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog Nueva Reserva */}
        <Dialog open={isNuevaReservaOpen} onOpenChange={setIsNuevaReservaOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Reserva</DialogTitle>
              <DialogDescription>
                Selecciona la fecha, hora y mesas para tu reserva
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
                 {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    min={todayLocal}
                    max={maxReservaDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Select value={hora} onValueChange={setHora}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {HORARIOS.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Número de Personas</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={numPersonas}
                  onChange={(e) => setNumPersonas(parseInt(e.target.value))}
                />
              </div>

              {fecha && hora && (
                <div className="space-y-2">
                  <Label>Selecciona tus Mesas</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {mesasDisponibles.length === 0 ? (
                      <p className="col-span-4 text-center text-gray-500 py-4">
                        No hay mesas disponibles para esta fecha y hora
                      </p>
                    ) : (
                     mesasDisponibles.map((mesa) => (
                        <button
                          key={mesa.mesaId}
                          type="button"
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            mesasSeleccionadas.includes(mesa.mesaId)
                              ? 'bg-amber-600 text-white border-amber-600'
                              : isMesaOcupada(mesa)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-amber-50 border-gray-300'
                          }`}
                          onClick={() => !isMesaOcupada(mesa) && toggleMesa(mesa.mesaId)}
                          disabled={isMesaOcupada(mesa)}
                        >
                          <p className="font-medium">{mesa.nombre || mesa.mesaNombre || `Mesa ${mesa.mesaId}`}</p>
                          <p className="text-xs">
                            {isMesaOcupada(mesa) ? 'Ocupada' : 'Disponible'}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                  {mesasSeleccionadas.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Mesas seleccionadas: {mesasSeleccionadas.length}
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNuevaReservaOpen(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleCrearReserva}
                disabled={!fecha || !hora || mesasSeleccionadas.length === 0}
              >
                {editReservaId ? 'Actualizar Reserva' : 'Continuar al Pago'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Pago */}
        <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pago de Reserva</DialogTitle>
              <DialogDescription>
                Completa el pago para confirmar tu reserva
              </DialogDescription>
            </DialogHeader>
            
            {preferenciaPago ? (
              <div className="space-y-4 py-4">
                <div className="bg-amber-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600 mb-2">Monto a pagar</p>
                  <p className="text-3xl font-bold text-amber-600">S/ 50.00</p>
                </div>
                
                <p className="text-sm text-gray-600 text-center">
                  Serás redirigido a MercadoPago para completar el pago de forma segura.
                </p>
                
                <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold mb-2">Términos y condiciones de reserva</p>
                  <p>
                    Al continuar con el pago, aceptas las políticas de La Pituca sobre reservas: la llegada debe
                    realizarse dentro del tiempo de tolerancia operativo de 15 minutos desde la hora reservada.
                    Si la asistencia no se registra dentro de ese intervalo, la reserva se clasifica como inasistencia
                    y no corresponde devolución del monto abonado.
                  </p>
                  <div className="mt-3 flex items-start gap-2">
                    <Checkbox
                      id="acepta-terminos-reserva"
                      checked={aceptaTerminos}
                      onCheckedChange={(checked) => setAceptaTerminos(checked === true)}
                    />
                    <Label htmlFor="acepta-terminos-reserva" className="leading-5">
                      He leído y acepto los términos y condiciones de la reserva.
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setIsPagoDialogOpen(false);
                      clearPreferenciaPago();
                      window.location.href = preferenciaPago.initPoint;
                    }}
                    disabled={!aceptaTerminos}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagar con MercadoPago
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsPagoDialogOpen(false);
                      clearPreferenciaPago();
                    }}
                  >
                    Pagar más tarde
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando opciones de pago...</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(detalleReserva)} onOpenChange={(open) => !open && setDetalleReserva(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle de reserva</DialogTitle>
              <DialogDescription>
                Información de tu reserva seleccionada.
              </DialogDescription>
            </DialogHeader>
            {detalleReserva && (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> #{detalleReserva.id}</p>
                <p><strong>Estado:</strong> {detalleReserva.estado}</p>
                <p><strong>Fecha:</strong> {formatLocalDate(detalleReserva.fechaReserva)}</p>
                <p><strong>Hora:</strong> {detalleReserva.horaReserva}</p>
                <p><strong>Personas:</strong> {detalleReserva.numPersonas}</p>
                <p><strong>Mesas seleccionadas:</strong> {(detalleReserva.mesasIds || []).join(', ') || 'Sin mesas registradas'}</p>
                <p><strong>Grupo:</strong> #{detalleReserva.grupoId ?? '-'}</p>
                <p><strong>Registro:</strong> {(detalleReserva.fechaRegistro || detalleReserva.fechaHoraRegistro) ? new Date((detalleReserva.fechaRegistro || detalleReserva.fechaHoraRegistro) as string).toLocaleString('es-PE') : '-'}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetalleReserva(null)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ClienteDashboard;