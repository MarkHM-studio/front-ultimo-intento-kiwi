import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from './components/AdminCrudLayout';
import { RowActions } from './components/RowActions';
import type { ClienteRequest } from '@/types';
import api from '@/services/api';
import type { Distrito } from '@/types';
import { useTablePagination } from '@/hooks/useTablePagination';
import { TablePagination } from './components/TablePagination';

const initialForm: ClienteRequest = {
  nombre: '', apellido: '', fechaNacimiento: '', telefono: '', correo: '', distritoId: 1, usuarioId: 1,
};
const normalizeStatus = (value?: string) => (value || '').trim().toUpperCase();

export const Clientes: React.FC = () => {
  const { clientes, fetchClientes, createCliente, updateCliente, deleteCliente, activateCliente } = useAdminStore();
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClienteRequest>(initialForm);

  useEffect(() => {
    fetchClientes(statusFilter);
    const fetchDistritos = async () => {
      try {
        const response = await api.get<Distrito[]>('/distrito');
        setDistritos(response.data);
      } catch (error) {
        console.error('Error cargando distritos', error);
      }
    };
    fetchDistritos();
  }, [fetchClientes, statusFilter]);

  const filtered = useMemo(() => clientes.filter((client: any) =>
    `${client.nombre} ${client.apellido} ${client.correo} ${client.telefono}`.toLowerCase().includes(search.toLowerCase()) &&
    (normalizeStatus(client.estado || 'ACTIVO') === statusFilter),
  ), [clientes, search, statusFilter]);
  const { paginatedData, currentPage, totalPages, totalItems, pageSize, setCurrentPage, setPageSize } = useTablePagination(filtered);

  const reset = () => {
    setForm(initialForm);
    setEditingId(null);
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const distritoSeleccionado = distritos.find((distrito) => distrito.id === form.distritoId);
    const payload: any = {
      ...form,
      distrito: distritoSeleccionado?.nombre ?? String(form.distritoId),
    };
    delete payload.distritoId;

    if (editingId) await updateCliente(editingId, payload);
    else await createCliente(payload);
    await fetchClientes(statusFilter);
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Clientes"
        subtitle="Gestión completa de clientes con datos de contacto y vínculo con usuario."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
        filters={(
          <select className="h-10 rounded-md border border-input px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'ACTIVO' | 'INACTIVO')}>
            <option value="ACTIVO">ACTIVOS</option>
            <option value="INACTIVO">INACTIVOS</option>
          </select>
        )}
      >
        <section className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Contacto</th>
                <th className="px-4 py-3 text-left">Distrito</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((client: any) => (
                <tr key={client.id} className="even:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{client.nombre} {client.apellido}</td>
                  <td className="px-4 py-3">{client.correo}<div className="text-xs text-muted-foreground">{client.telefono}</div></td>
                  <td className="px-4 py-3">{client.distrito?.nombre || client.distrito || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      onEdit={() => {
                        setEditingId(client.id);
                        setForm({
                          nombre: client.nombre,
                          apellido: client.apellido,
                          fechaNacimiento: client.fechaNacimiento,
                          telefono: client.telefono,
                          correo: client.correo,
                          distritoId: client.distrito?.id || 1,
                          usuarioId: client.usuario?.id || client.usuarioId || 1,
                        });
                        setOpen(true);
                      }}
                      onDelete={normalizeStatus(client.estado) === 'INACTIVO' ? undefined : async () => {
                        await deleteCliente(client.id);
                        await fetchClientes(statusFilter);
                      }}
                      inactive={normalizeStatus(client.estado) === 'INACTIVO'}
                      onActivate={async () => {
                        await activateCliente(client.id);
                        await fetchClientes(statusFilter);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </section>
      </AdminCrudLayout>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
            <DialogDescription>Completa los campos requeridos por la API de clientes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            <Input type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
            <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <Input placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
            <select className="h-10 rounded-md border border-input px-3 text-sm" value={form.distritoId} onChange={(e) => setForm({ ...form, distritoId: Number(e.target.value) })}>
              {distritos.length === 0 && <option value={form.distritoId}>Cargando distritos...</option>}
              {distritos.map((distrito) => (
                <option key={distrito.id} value={distrito.id}>
                  {distrito.id} - {distrito.nombre}
                </option>
              ))}
            </select>
            <Input type="number" placeholder="ID Usuario" value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: Number(e.target.value) })} />
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

export default Clientes;