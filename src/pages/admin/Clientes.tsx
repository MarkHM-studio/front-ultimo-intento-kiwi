import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ClienteRequest } from '@/types';

const initialForm: ClienteRequest = {
  nombre: '', apellido: '', fechaNacimiento: '', telefono: '', correo: '', distritoId: 1, usuarioId: 1,
};

export const Clientes: React.FC = () => {
  const { clientes, fetchClientes, createCliente, updateCliente, deleteCliente } = useAdminStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClienteRequest>(initialForm);

  useEffect(() => { fetchClientes(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateCliente(editingId, form);
    else await createCliente(form);
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar' : 'Nuevo'} cliente</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid md:grid-cols-4 gap-2">
              <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Input placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
              <Input type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
              <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              <Input type="email" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
              <Input type="number" placeholder="Distrito ID" value={form.distritoId} onChange={(e) => setForm({ ...form, distritoId: Number(e.target.value) })} />
              <Input type="number" placeholder="Usuario ID" value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: Number(e.target.value) })} />
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
              {clientes.map((c) => (
                <div key={c.id} className="flex items-center justify-between border rounded p-3">
                  <span>{c.nombre} {c.apellido} - {c.correo}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(c.id); setForm({ nombre: c.nombre, apellido: c.apellido, fechaNacimiento: c.fechaNacimiento, telefono: c.telefono, correo: c.correo, distritoId: c.distrito.id, usuarioId: c.usuario.id }); }}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCliente(c.id)}>Eliminar</Button>
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

export default Clientes;