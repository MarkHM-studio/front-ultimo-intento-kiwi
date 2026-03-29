import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProveedorRequest } from '@/types';

const initialForm: ProveedorRequest = {
  contacto: '',
  razonSocial: '',
  ruc: '',
  direccion: '',
  telefono: '',
  correo: '',
};

export const Proveedores: React.FC = () => {
  const { proveedores, fetchProveedores, createProveedor, updateProveedor, deleteProveedor } = useAdminStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProveedorRequest>(initialForm);

  useEffect(() => { fetchProveedores(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateProveedor(editingId, form);
    else await createProveedor(form);
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Proveedores</h2>
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar' : 'Nuevo'} proveedor</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid md:grid-cols-3 gap-2">
              <Input placeholder="Contacto" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
              <Input placeholder="Razón social" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} />
              <Input placeholder="RUC" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
              <Input placeholder="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              <Input type="email" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
              <div className="md:col-span-3 flex gap-2">
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
              {proveedores.map((p) => (
                <div key={p.id} className="flex items-center justify-between border rounded p-3">
                  <span>{p.razonSocial} - {p.ruc}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(p.id); setForm({ contacto: p.contacto, razonSocial: p.razonSocial, ruc: p.ruc, direccion: p.direccion, telefono: p.telefono, correo: p.correo }); }}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteProveedor(p.id)}>Eliminar</Button>
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

export default Proveedores;