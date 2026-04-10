import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/common/MainLayout';
import { useReservaStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Users, ArrowLeft, XCircle, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

export const MisReservasPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    reservasUsuario,
    preferenciaPago,
    fetchReservasByUsuario,
    cancelarReserva,
    crearPreferenciaPago,
    clearPreferenciaPago,
  } = useReservaStore();
  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | 'EXPIRADO' | 'ESPERANDO PAGO' | 'PAGADO' | 'CANCELADO'>('ESPERANDO PAGO');
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [detalleReserva, setDetalleReserva] = useState<(typeof reservasUsuario)[number] | null>(null);

  useEffect(() => {
    fetchReservasByUsuario();
  }, [fetchReservasByUsuario]);

  useEffect(() => {
    if ((location.state as any)?.openPago && preferenciaPago) {
      setIsPagoDialogOpen(true);
    }
  }, [location.state, preferenciaPago]);

  const reservas = useMemo(() => {
    const ordered = [...reservasUsuario].sort((a, b) => new Date(b.fechaHoraRegistro || 0).getTime() - new Date(a.fechaHoraRegistro || 0).getTime());
    if (estadoFiltro === 'TODOS') return ordered;
    return ordered.filter((reserva) => {
      if (estadoFiltro === 'EXPIRADO') return reserva.estado === 'EXPIRADO';
      return reserva.estado === estadoFiltro;
    });
  }, [reservasUsuario, estadoFiltro]);

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      'ESPERANDO PAGO': 'bg-yellow-100 text-yellow-800',
      'PAGADO': 'bg-green-100 text-green-800',
      'CANCELADO': 'bg-red-100 text-red-800',
      'EXPIRADO': 'bg-slate-100 text-slate-800',
      'NO_SHOW': 'bg-red-100 text-red-800',
    };
    return styles[estado] || 'bg-gray-100';
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ESPERANDO PAGO': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'PAGADO': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CANCELADO': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const handleCancelar = async (reservaId: number) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;
    await cancelarReserva(reservaId);
    await fetchReservasByUsuario();
  };

  const handlePagar = async (reservaId: number, fechaReserva: string, horaReserva: string) => {
    await crearPreferenciaPago({
      reservaId,
      descripcion: `Reserva en La Pituca - ${fechaReserva} ${horaReserva}`,
      monto: 50,
    });
    setAceptaTerminos(false);
    setIsPagoDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mis Reservas</h2>
            <p className="text-gray-500">Historial y seguimiento de reservas.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/cliente')}>
            <ArrowLeft className="mr-2 h-4 w-4" />Volver a reservar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {['EXPIRADO', 'ESPERANDO PAGO', 'PAGADO', 'CANCELADO', 'TODOS'].map((estado) => (
            <Button key={estado} size="sm" variant={estadoFiltro === estado ? 'default' : 'outline'} onClick={() => setEstadoFiltro(estado as any)}>
              {estado}
            </Button>
          ))}
        </div>

        {reservas.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg text-gray-500">No tienes reservas en este estado.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {reservas.map((reserva) => (
              <Card key={reserva.id} className={`${reserva.estado === 'CANCELADO' ? 'opacity-70' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Reserva #{reserva.id}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getEstadoIcon(reserva.estado)}
                      <Badge className={getEstadoBadge(reserva.estado)}>{reserva.estado}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-500"><Calendar className="h-4 w-4" />Fecha</span><span>{reserva.fechaReserva}</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-500"><Clock className="h-4 w-4" />Hora</span><span>{reserva.horaReserva}</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-500"><Users className="h-4 w-4" />Personas</span><span>{reserva.numPersonas}</span></div>
                  <Button variant="outline" className="mt-2 w-full" onClick={() => setDetalleReserva(reserva)}>
                    Ver detalle
                  </Button>

                  {reserva.estado === 'ESPERANDO PAGO' && (
                    <Button className="mt-2 w-full bg-green-600 hover:bg-green-700" onClick={() => handlePagar(reserva.id, reserva.fechaReserva, reserva.horaReserva)}>
                      <CreditCard className="mr-2 h-4 w-4" />Pagar reserva
                    </Button>
                  )}

                  {(reserva.estado === 'ESPERANDO PAGO' || reserva.estado === 'PAGADO') && (
                    <Button variant="outline" className="mt-2 w-full text-red-600" onClick={() => handleCancelar(reserva.id)}>
                      <XCircle className="mr-2 h-4 w-4" />Cancelar reserva
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pago de Reserva</DialogTitle>
            <DialogDescription>Completa el pago para confirmar tu reserva.</DialogDescription>
          </DialogHeader>

          {preferenciaPago ? (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-amber-50 p-4 text-center">
                <p className="mb-2 text-gray-600">Monto a pagar</p>
                <p className="text-3xl font-bold text-amber-600">S/ 50.00</p>
              </div>

              <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                <p className="mb-2 font-semibold">Términos y condiciones de reserva</p>
                <p>La llegada debe registrarse dentro de 15 minutos desde la hora reservada. Si no, se considera inasistencia.</p>
                <div className="mt-3 flex items-start gap-2">
                  <Checkbox id="acepta-terminos-reserva" checked={aceptaTerminos} onCheckedChange={(checked) => setAceptaTerminos(checked === true)} />
                  <Label htmlFor="acepta-terminos-reserva" className="leading-5">He leído y acepto los términos y condiciones de la reserva.</Label>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    window.open(preferenciaPago.initPoint, '_blank', 'noopener,noreferrer');
                    setIsPagoDialogOpen(false);
                  }}
                  disabled={!aceptaTerminos}
                >
                  <CreditCard className="mr-2 h-4 w-4" />Pagar con MercadoPago
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setIsPagoDialogOpen(false); clearPreferenciaPago(); }}>Pagar más tarde</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detalleReserva)} onOpenChange={(open) => !open && setDetalleReserva(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Reserva #{detalleReserva?.id}</DialogTitle>
            <DialogDescription>Información completa de tu reserva.</DialogDescription>
          </DialogHeader>
          {detalleReserva && (
            <div className="space-y-2 text-sm">
              <p><strong>Estado:</strong> {detalleReserva.estado}</p>
              <p><strong>Fecha:</strong> {detalleReserva.fechaReserva}</p>
              <p><strong>Hora:</strong> {detalleReserva.horaReserva}</p>
              <p><strong>Personas:</strong> {detalleReserva.numPersonas}</p>
              <p><strong>Mesas:</strong> {detalleReserva.mesasIds?.join(', ') || 'Sin mesas asociadas'}</p>
              <p><strong>Registro:</strong> {detalleReserva.fechaHoraRegistro ? new Date(detalleReserva.fechaHoraRegistro).toLocaleString() : '-'}</p>
              <p><strong>Expiración pago:</strong> {detalleReserva.fechaHoraExpiracionPago ? new Date(detalleReserva.fechaHoraExpiracionPago).toLocaleString() : '-'}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default MisReservasPage;