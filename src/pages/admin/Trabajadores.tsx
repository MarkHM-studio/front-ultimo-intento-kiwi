import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TrabajadorRequest } from '@/types';

const initialForm: TrabajadorRequest = {
  nombre: '', apellido: '', dni: '', telefono: '', correo: '', fechaInicio: '', fechaFin: '', usuarioId: 1, tipoJornadaId: 1, turnoId: 1,
};

export const Trabajadores: React.FC = () => {
  const { trabajadores, fetchTrabajadores, createTrabajador, updateTrabajador, deleteTrabajador } = useAdminStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TrabajadorRequest>(initialForm);

  useEffect(() => { fetchTrabajadores(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateTrabajador(editingId, form);
    else await createTrabajador(form);
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Trabajadores</h2>
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar' : 'Nuevo'} trabajador</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid md:grid-cols-4 gap-2">
              <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Input placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
              <Input placeholder="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
              <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              <Input type="email" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
              <Input type="date" placeholder="Fecha inicio" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
              <Input type="date" placeholder="Fecha fin" value={form.fechaFin || ''} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
              <Input type="number" placeholder="Usuario ID" value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: Number(e.target.value) })} />
              <Input type="number" placeholder="Tipo Jornada ID" value={form.tipoJornadaId} onChange={(e) => setForm({ ...form, tipoJornadaId: Number(e.target.value) })} />
              <Input type="number" placeholder="Turno ID" value={form.turnoId} onChange={(e) => setForm({ ...form, turnoId: Number(e.target.value) })} />
              <div className="md:col-span-4 flex gap-2">
                <Button type="submit">{editingId ? 'Actualizar' : 'Crear'}</Button>
                {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancelar</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trabajadores.map((t) => (
                <div key={t.id} className="flex items-center justify-between border rounded p-3">
                  <span>{t.nombre} {t.apellido} - {t.correo}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(t.id); setForm({ nombre: t.nombre, apellido: t.apellido, dni: t.dni, telefono: t.telefono, correo: t.correo, fechaInicio: t.fechaInicio, fechaFin: t.fechaFin, usuarioId: t.usuario.id, tipoJornadaId: t.tipoJornada.id, turnoId: t.turno.id }); }}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteTrabajador(t.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Trabajadores;