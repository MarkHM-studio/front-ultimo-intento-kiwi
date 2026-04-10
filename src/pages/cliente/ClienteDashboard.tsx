import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/common/MainLayout';
import { useReservaStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Table as TableIcon, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';

const HORARIOS = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

const getCurrentDateInput = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getCurrentHourSlot = () => {
  const currentHour = new Date().getHours();
  const nearest = Math.max(17, Math.min(22, currentHour));
  return `${String(nearest).padStart(2, '0')}:00`;
};

const getMaxDateInput = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const ClienteDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    reservasUsuario,
    mesasDisponibles,
    fetchReservasByUsuario,
    fetchMesasDisponibles,
    createReserva,
    crearPreferenciaPago,
  } = useReservaStore();

  const [selectedDate, setSelectedDate] = useState(getCurrentDateInput());
  const [selectedHora, setSelectedHora] = useState(getCurrentHourSlot());
  const [selectedMesas, setSelectedMesas] = useState<number[]>([]);
  const [numeroPersonas, setNumeroPersonas] = useState(2);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxDate = useMemo(() => getMaxDateInput(), []);
  const horariosDisponibles = useMemo(() => {
    const today = getCurrentDateInput();
    if (selectedDate !== today) return HORARIOS;
    const currentHour = new Date().getHours();
    return HORARIOS.filter((hora) => Number(hora.split(':')[0]) >= currentHour);
  }, [selectedDate]);

  useEffect(() => {
    fetchReservasByUsuario();
  }, [fetchReservasByUsuario]);

  useEffect(() => {
    if (!selectedHora) return;
    fetchMesasDisponibles(selectedDate, selectedHora);
  }, [selectedDate, selectedHora, fetchMesasDisponibles]);

  useEffect(() => {
    if (!horariosDisponibles.includes(selectedHora)) {
      setSelectedHora(horariosDisponibles[0] || '');
    }
  }, [horariosDisponibles, selectedHora]);

  useEffect(() => {
    const syncNow = () => {
      setSelectedDate(getCurrentDateInput());
      setSelectedHora(getCurrentHourSlot());
    };

    syncNow();
    const interval = setInterval(syncNow, 60_000);
    return () => clearInterval(interval);
  }, []);

  const misReservas = reservasUsuario.filter((r) => r.estado === 'ESPERANDO PAGO' || r.estado === 'PAGADO');

  const horaFin = `${String(Math.min(23, parseInt(selectedHora.split(':')[0], 10) + 2)).padStart(2, '0')}:00`;

  const toggleMesa = (mesaId: number) => {
    setSelectedMesas((prev) => (prev.includes(mesaId) ? prev.filter((id) => id !== mesaId) : [...prev, mesaId]));
  };

  const handleReservar = async () => {
    if (!user || selectedMesas.length === 0 || !selectedHora) return;

    setIsSubmitting(true);
    try {
      const reserva = await createReserva({
        fechaReserva: selectedDate,
        horaReserva: selectedHora,
        numPersonas: numeroPersonas,
        usuarioId: user.usuarioId,
        mesasId: selectedMesas,
        sucursalId: 1,
      });

      if (reserva.estado === 'ESPERANDO PAGO') {
        await crearPreferenciaPago({
          reservaId: reserva.id,
          descripcion: `Reserva en La Pituca - ${selectedDate} ${selectedHora}`,
          monto: 50,
        });
      }

      setConfirmDialogOpen(false);
      setSelectedMesas([]);
      navigate('/cliente/mis-reservas', { state: { openPago: true, reservaId: reserva.id } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'No se pudo registrar la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {misReservas.length > 0 && (
          <Card className="border-[#8B4513]/20 bg-[#8B4513]/5">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-[#8B4513]">Mis Reservas Activas</h3>
                <Button variant="link" onClick={() => navigate('/cliente/mis-reservas')} className="text-[#8B4513]">
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {misReservas.slice(0, 3).map((reserva) => (
                  <Badge key={reserva.id} variant="outline" className="bg-white">
                    {reserva.fechaReserva} {reserva.horaReserva} ({reserva.mesasIds?.length || 0} mesa(s))
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label className="mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" />Fecha</Label>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={getCurrentDateInput()} max={maxDate} />
              </div>
              <div>
                <Label className="mb-2 flex items-center gap-2"><Clock className="h-4 w-4" />Hora</Label>
                <Select value={selectedHora} onValueChange={setSelectedHora}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {horariosDisponibles.length > 0 ? (
                      horariosDisponibles.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)
                    ) : (
                      <div className="px-3 py-2 text-sm text-slate-500">No hay horarios disponibles para hoy.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 flex items-center gap-2"><Users className="h-4 w-4" />Personas</Label>
                <Input type="number" min={1} max={20} value={numeroPersonas} onChange={(e) => setNumeroPersonas(parseInt(e.target.value, 10) || 1)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Selecciona tus mesas</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-green-500" />Disponible</div>
                <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-[#8B4513]" />Seleccionada</div>
              </div>
            </div>

            {mesasDisponibles.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <TableIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p>No hay mesas disponibles para este horario</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {mesasDisponibles.filter((m) => !m.ocupada && m.estado !== 'OCUPADO').map((mesa) => (
                  <button
                    key={mesa.mesaId}
                    onClick={() => toggleMesa(mesa.mesaId)}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      selectedMesas.includes(mesa.mesaId)
                        ? 'border-[#8B4513] bg-[#8B4513] text-white'
                        : 'border-gray-200 bg-white hover:border-green-400'
                    }`}
                  >
                    <TableIcon className={`mx-auto mb-2 h-6 w-6 ${selectedMesas.includes(mesa.mesaId) ? 'text-white' : 'text-gray-400'}`} />
                    <p className="text-sm font-medium">{mesa.nombre || mesa.mesaNombre || `Mesa ${mesa.mesaId}`}</p>
                    <p className={`text-xs ${selectedMesas.includes(mesa.mesaId) ? 'text-white/80' : 'text-gray-500'}`}>
                      {(mesa.capacidad || 4)} pers.
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedMesas.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setConfirmDialogOpen(true)} className="bg-[#8B4513] hover:bg-[#5D2E0C]">
                  <CheckCircle className="mr-2 h-4 w-4" />Confirmar Reserva ({selectedMesas.length} mesa(s))
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Confirmar Reserva</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <p><span className="text-gray-500">Fecha:</span> {selectedDate}</p>
                <p><span className="text-gray-500">Horario:</span> {selectedHora} - {horaFin}</p>
                <p><span className="text-gray-500">Mesas:</span> {selectedMesas.length}</p>
                <p><span className="text-gray-500">Personas:</span> {numeroPersonas}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleReservar} disabled={isSubmitting} className="bg-[#8B4513] hover:bg-[#5D2E0C]">Confirmar Reserva</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ClienteDashboard;