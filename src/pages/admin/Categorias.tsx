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
import { getCategoryClass } from './components/categoryUtils';

export const Categorias: React.FC = () => {
  const { categorias, fetchCategorias, createCategoria, updateCategoria } = useAdminStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const formatDate = (value?: string) => value ? new Date(value).toLocaleString('es-PE') : '-';

  useEffect(() => { fetchCategorias(); }, [fetchCategorias]);

  const filtered = useMemo(() => categorias.filter((category) =>
    category.nombre.toLowerCase().includes(search.toLowerCase()),
  ), [categorias, search]);
  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = useTablePagination(filtered);

  const reset = () => {
    setEditingId(null);
    setNombre('');
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nombre.trim()) return;
    if (editingId) await updateCategoria(editingId, { nombre });
    else await createCategoria({ nombre });
    await fetchCategorias();
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Categorías"
        subtitle="Clasifica productos e insumos para mantener un catálogo ordenado."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
      >
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Fecha creación</th>
                <th className="px-4 py-3 text-left">Fecha actualización</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((category) => (
                <tr key={category.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getCategoryClass(category.id, category.nombre)}`}>{category.nombre}</span>
                  </td>
                  <td className="px-4 py-3">{formatDate(category.fechaHoraRegistro)}</td>
                  <td className="px-4 py-3">{formatDate(category.fechaHoraActualizacion || category.fechaHoraRegistro)}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onEdit={() => { setEditingId(category.id); setNombre(category.nombre); setOpen(true); }} />
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
            <DialogTitle>{editingId ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
            <DialogDescription>Ingresa el nombre de la categoría.</DialogDescription>
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

export default Categorias;