import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from './components/AdminCrudLayout';
import { RowActions } from './components/RowActions';
import type { TrabajadorRequest } from '@/types';

const initialForm: TrabajadorRequest = {
  nombre: '', apellido: '', dni: '', telefono: '', correo: '', fechaInicio: '', fechaFin: '', estado: 'ACTIVO', usuarioId: 1, tipoJornadaId: 1, turnoId: 3,
};

const TIPOS_JORNADA = [
  { id: 1, label: 'TIEMPO COMPLETO' },
  { id: 2, label: 'TIEMPO PARCIAL' },
];

const TURNOS = [
  { id: 1, label: 'NOCHE' },
  { id: 2, label: 'MADRUGADA' },
  { id: 3, label: 'NOCHE Y MADRUGADA' },
];

const normalizeText = (value?: string) => (value || '').trim().toUpperCase();

const resolveTipoJornadaId = (worker: any) => {
  const nombreJornada = normalizeText(worker.nombreJornada || worker.tipoJornada?.nombre);
  if (nombreJornada === 'TIEMPO COMPLETO') return 1;
  if (nombreJornada === 'TIEMPO PARCIAL') return 2;

  const candidate = Number(worker.tipoJornada?.id ?? worker.tipoJornadaId);
  return candidate === 1 || candidate === 2 ? candidate : 1;
};

const resolveTurnoId = (worker: any) => {
  const nombreTurno = normalizeText(worker.nombreTurno || worker.turno?.nombre);
  if (nombreTurno === 'NOCHE') return 1;
  if (nombreTurno === 'MADRUGADA') return 2;
  if (nombreTurno === 'NOCHE Y MADRUGADA') return 3;

  const candidate = Number(worker.turno?.id ?? worker.turnoId);
  return candidate >= 1 && candidate <= 3 ? candidate : 3;
};
const normalizeStatus = (value?: string) => (value || '').trim().toUpperCase();

const formatDateForApi = (value: string) => {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) return value;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const Trabajadores: React.FC = () => {
  const { trabajadores, fetchTrabajadores, createTrabajador, updateTrabajador, deleteTrabajador, activateTrabajador } = useAdminStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TrabajadorRequest>(initialForm);
  const turnosPermitidos = useMemo(() => (
    form.tipoJornadaId === 1 ? TURNOS.filter((shift) => shift.id === 3) : TURNOS.filter((shift) => shift.id === 1 || shift.id === 2)
  ), [form.tipoJornadaId]);

  useEffect(() => { fetchTrabajadores(statusFilter); }, [fetchTrabajadores, statusFilter]);

  const filtered = useMemo(() => trabajadores.filter((worker) =>
    `${worker.nombre} ${worker.apellido} ${worker.dni} ${worker.correo}`.toLowerCase().includes(search.toLowerCase()) &&
    (normalizeStatus(worker.estado || 'ACTIVO') === statusFilter),
  ), [trabajadores, search, statusFilter]);

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: TrabajadorRequest = {
      ...form,
      estado: form.estado || 'ACTIVO',
      fechaInicio: formatDateForApi(form.fechaInicio),
      fechaFin: form.fechaFin ? formatDateForApi(form.fechaFin) : undefined,
      turnoId: form.tipoJornadaId === 1 ? 3 : form.turnoId,
    };
    if (editingId) await updateTrabajador(editingId, payload);
    else await createTrabajador(payload);
    await fetchTrabajadores(statusFilter);
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Trabajadores"
        subtitle="Gestión completa del personal vinculado a turnos y tipo de jornada."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
        filters={(
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'ACTIVO' | 'INACTIVO')}>
            <option value="ACTIVO">ACTIVOS</option>
            <option value="INACTIVO">INACTIVOS</option>
          </select>
        )}
      >
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Trabajador</th>
                <th className="px-4 py-3 text-left">Documento</th>
                <th className="px-4 py-3 text-left">Jornada</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((worker: any) => (
                <tr key={worker.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{worker.nombre} {worker.apellido}<div className="text-xs text-slate-500">{worker.correo}</div></td>
                  <td className="px-4 py-3">DNI {worker.dni}<div className="text-xs text-slate-500">{worker.telefono}</div></td>
                  <td className="px-4 py-3">{worker.tipoJornada?.nombre || worker.nombreJornada || '-'}<div className="text-xs text-slate-500">Turno: {worker.turno?.nombre || worker.nombreTurno || '-'}</div></td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      onEdit={() => {
                        setEditingId(worker.id);
                        const tipoJornadaId = resolveTipoJornadaId(worker);
                        const turnoId = resolveTurnoId(worker);
                        setForm({
                          nombre: worker.nombre,
                          apellido: worker.apellido,
                          dni: worker.dni,
                          telefono: worker.telefono,
                          correo: worker.correo,
                          fechaInicio: worker.fechaInicio,
                          fechaFin: worker.fechaFin,
                          estado: worker.estado || 'ACTIVO',
                          usuarioId: worker.usuario?.id || worker.usuarioId || 1,
                          tipoJornadaId,
                          turnoId: tipoJornadaId === 1 ? 3 : (turnoId === 3 ? 1 : turnoId),
                        });
                        setOpen(true);
                      }}
                      onDelete={normalizeStatus(worker.estado) === 'INACTIVO' ? undefined : async () => {
                        await deleteTrabajador(worker.id);
                        await fetchTrabajadores(statusFilter);
                      }}
                      inactive={normalizeStatus(worker.estado) === 'INACTIVO'}
                      onActivate={async () => {
                        await activateTrabajador(worker.id);
                        await fetchTrabajadores(statusFilter);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </AdminCrudLayout>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar trabajador' : 'Nuevo trabajador'}</DialogTitle>
            <DialogDescription>Completa los datos para registrar al trabajador.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            <Input placeholder="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
            <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <Input placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
            <Input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
            <Input type="date" value={form.fechaFin || ''} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={form.estado || 'ACTIVO'} onChange={(e) => setForm({ ...form, estado: e.target.value as 'ACTIVO' | 'INACTIVO' })}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
            <Input type="number" placeholder="ID Usuario" value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: Number(e.target.value) })} />
            <select
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
              value={form.tipoJornadaId}
              onChange={(e) => {
                const tipoJornadaId = Number(e.target.value);
                setForm((previous) => ({
                  ...previous,
                  tipoJornadaId,
                  turnoId: tipoJornadaId === 1 ? 3 : (previous.turnoId === 3 ? 1 : previous.turnoId),
                }));
              }}
            >
              {TIPOS_JORNADA.map((jornada) => (
                <option key={jornada.id} value={jornada.id}>
                  {jornada.id} - {jornada.label}
                </option>
              ))}
            </select>
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={form.turnoId} onChange={(e) => setForm({ ...form, turnoId: Number(e.target.value) })}>
              {turnosPermitidos.map((turno) => (
                <option key={turno.id} value={turno.id}>
                  {turno.id} - {turno.label}
                </option>
              ))}
            </select>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Trabajadores;