import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore, useComprobanteStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from '@/pages/admin/components/AdminCrudLayout';
import { RowActions } from '@/pages/admin/components/RowActions';
import { useTablePagination } from '@/hooks/useTablePagination';
import { TablePagination } from '@/pages/admin/components/TablePagination';
import type { MesaRequest } from '@/types';

const initialForm: MesaRequest = { nombre: '' };

export const Mesas: React.FC = () => {
  const { mesas, fetchMesas, createMesa, updateMesa, deleteMesa } = useAdminStore();
  const { mesasOcupadas, fetchMesasOcupadas } = useComprobanteStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MesaRequest>(initialForm);
  const formatDate = (value?: string) => value ? new Date(value).toLocaleString('es-PE') : '-';

  useEffect(() => {
    fetchMesas();
    fetchMesasOcupadas();
  }, [fetchMesas, fetchMesasOcupadas]);

  const filtered = useMemo(() => mesas.filter((table) => {
    const bySearch = table.nombre.toLowerCase().includes(search.toLowerCase());
    const byStatus = statusFilter === 'TODOS' || table.estado === statusFilter;
    return bySearch && byStatus;
  }), [mesas, search, statusFilter]);
  const { paginatedData, currentPage, totalPages, totalItems, pageSize, setCurrentPage, setPageSize } = useTablePagination(filtered);

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingId) await updateMesa(editingId, form);
    else await createMesa(form);
    await fetchMesas();
    reset();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <AdminCrudLayout
          title="Mesas"
          subtitle="Gestión completa de mesas del local (crear, editar y eliminar)."
          search={search}
          onSearch={setSearch}
          onCreate={() => setOpen(true)}
          filters={(
            <select className="h-10 rounded-md border border-input px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="TODOS">Todos los estados</option>
              <option value="OCUPADO">Ocupado</option>
              <option value="DESOCUPADO">Desocupado</option>
            </select>
          )}
        >
          <section className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Mesa</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha creación</th>
                  <th className="px-4 py-3 text-left">Fecha actualización</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((table) => (
                  <tr key={table.id} className="even:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{table.nombre}</td>
                    <td className="px-4 py-3">{table.estado}</td>
                    <td className="px-4 py-3">{formatDate(table.fechaHoraRegistro)}</td>
                    <td className="px-4 py-3">{formatDate(table.fechaHoraActualizacion || table.fechaHoraRegistro)}</td>
                    <td className="px-4 py-3 text-right">
                      <RowActions
                        onEdit={() => {
                          setEditingId(table.id);
                          setForm({ nombre: table.nombre });
                          setOpen(true);
                        }}
                        onDelete={async () => {
                          await deleteMesa(table.id);
                          await fetchMesas();
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

        <Card className="rounded-2xl p-4">
          <h3 className="mb-3 text-base font-semibold">Mesas ocupadas</h3>
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Mesa</th>
                <th className="px-4 py-2 text-left">Grupo</th>
                <th className="px-4 py-2 text-left">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {mesasOcupadas.map((table: any) => (
                <tr key={table.mesaId} className="even:bg-muted/30">
                  <td className="px-4 py-2">{table.nombre || table.mesaNombre}</td>
                  <td className="px-4 py-2">Grupo #{table.grupoId}</td>
                  <td className="px-4 py-2">Comprobante #{table.comprobanteId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar mesa' : 'Nueva mesa'}</DialogTitle>
            <DialogDescription>Ingresa el nombre de la mesa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Nombre de mesa" value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Mesas;