import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from './components/AdminCrudLayout';
import { RowActions } from './components/RowActions';
import { useTablePagination } from '@/hooks/useTablePagination';
import { TablePagination } from './components/TablePagination';

export const Marcas: React.FC = () => {
  const { marcas, fetchMarcas, createMarca, updateMarca } = useAdminStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const formatDate = (value?: string) => value ? new Date(value).toLocaleString('es-PE') : '-';

  useEffect(() => { fetchMarcas(); }, [fetchMarcas]);

  const filtered = useMemo(() => marcas.filter((brand) =>
    brand.nombre.toLowerCase().includes(search.toLowerCase()),
  ), [marcas, search]);
  const { paginatedData, currentPage, totalPages, totalItems, pageSize, setCurrentPage, setPageSize } = useTablePagination(filtered);

  const reset = () => { setEditingId(null); setNombre(''); setOpen(false); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nombre.trim()) return;
    if (editingId) await updateMarca(editingId, { nombre });
    else await createMarca({ nombre });
    await fetchMarcas();
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Marcas"
        subtitle="Administra el catálogo de marcas para productos e insumos."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
      >
        <section className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Marca</th>
                <th className="px-4 py-3 text-left">Fecha creación</th>
                <th className="px-4 py-3 text-left">Fecha actualización</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((brand) => (
                <tr key={brand.id} className="even:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{brand.nombre}</td>
                  <td className="px-4 py-3">{formatDate(brand.fechaHoraRegistro)}</td>
                  <td className="px-4 py-3">{formatDate(brand.fechaHoraActualizacion || brand.fechaHoraRegistro)}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onEdit={() => { setEditingId(brand.id); setNombre(brand.nombre); setOpen(true); }} />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar marca' : 'Nueva marca'}</DialogTitle>
            <DialogDescription>Completa el nombre de la marca.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
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

export default Marcas;