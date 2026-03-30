import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from '@/pages/admin/components/AdminCrudLayout';
import { RowActions } from '@/pages/admin/components/RowActions';
import type { ProveedorRequest } from '@/types';

const initialForm: ProveedorRequest = { contacto: '', razonSocial: '', ruc: '', direccion: '', telefono: '', correo: '' };

export const Proveedores: React.FC = () => {
  const { proveedores, fetchProveedores, createProveedor, updateProveedor } = useAdminStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProveedorRequest>(initialForm);

  useEffect(() => { fetchProveedores(); }, [fetchProveedores]);

  const filtered = useMemo(() => proveedores.filter((provider) => {
    const bySearch = `${provider.razonSocial} ${provider.ruc} ${provider.contacto}`.toLowerCase().includes(search.toLowerCase());
    const byStatus = statusFilter === 'TODOS' || provider.estado === statusFilter;
    return bySearch && byStatus;
  }), [proveedores, search, statusFilter]);

  const reset = () => { setEditingId(null); setForm(initialForm); setOpen(false); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingId) await updateProveedor(editingId, form);
    else await createProveedor(form);
    await fetchProveedores();
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Proveedores"
        subtitle="Mantenimiento de proveedores con información de contacto, RUC y correo."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
        filters={(
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        )}
      >
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">RUC / Contacto</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((provider) => (
                <tr key={provider.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{provider.razonSocial}<div className="text-xs text-slate-500">{provider.correo}</div></td>
                  <td className="px-4 py-3">{provider.ruc}<div className="text-xs text-slate-500">{provider.contacto} - {provider.telefono}</div></td>
                  <td className="px-4 py-3">{provider.estado}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onEdit={() => {
                      setEditingId(provider.id);
                      setForm({
                        contacto: provider.contacto,
                        razonSocial: provider.razonSocial,
                        ruc: provider.ruc,
                        direccion: provider.direccion,
                        telefono: provider.telefono,
                        correo: provider.correo,
                      });
                      setOpen(true);
                    }} />
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
            <DialogTitle>{editingId ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
            <DialogDescription>Completa los datos principales del proveedor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Razón social" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} />
            <Input placeholder="Contacto" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
            <Input placeholder="RUC" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
            <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <Input placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
            <Input placeholder="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
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

export default Proveedores;