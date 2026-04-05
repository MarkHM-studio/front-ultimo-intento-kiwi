import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from '@/pages/admin/components/AdminCrudLayout';
import { RowActions } from '@/pages/admin/components/RowActions';
import type { InsumoRequest } from '@/types';
import { useTablePagination } from '@/hooks/useTablePagination';
import { TablePagination } from '@/pages/admin/components/TablePagination';
import { getCategoryClass } from '@/pages/admin/components/categoryUtils';

const initialForm: InsumoRequest = { nombre: '', precio: 0, stock: 0, unidadMedida: 'KG', marcaId: undefined, categoriaId: 0 };

export const Insumos: React.FC = () => {
  const { insumos, marcas, categorias, fetchInsumos, fetchMarcas, fetchCategorias, createInsumo, updateInsumo } = useAdminStore();
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('TODOS');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<InsumoRequest>(initialForm);

  useEffect(() => { fetchInsumos(); fetchMarcas(); fetchCategorias(); }, [fetchInsumos, fetchMarcas, fetchCategorias]);

  const filtered = useMemo(() => insumos.filter((supply) => {
    const bySearch = supply.nombre.toLowerCase().includes(search.toLowerCase());
    const byUnit = unitFilter === 'TODOS' || supply.unidadMedida === unitFilter;
    return bySearch && byUnit;
  }), [insumos, search, unitFilter]);
  const { paginatedData, currentPage, totalPages, totalItems, pageSize, setCurrentPage, setPageSize } = useTablePagination(filtered);

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.categoriaId) return;
    if (editingId) await updateInsumo(editingId, form, true);
    else await createInsumo(form);
    await fetchInsumos();
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Insumos"
        subtitle="Gestión de insumos con precios, unidades y stock actual para operaciones de almacén."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
        filters={(
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}>
            <option value="TODOS">Todas las unidades</option>
            <option value="KG">KG</option>
            <option value="L">L</option>
            <option value="UDS">UDS</option>
          </select>
        )}
      >
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Insumo</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Unidad</th>
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((supply) => (
                <tr key={supply.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{supply.nombre}<div className="text-xs text-slate-500">Marca: {supply.marca?.nombre || 'Sin marca'}</div></td>
                  <td className="px-4 py-3">
                    {(() => {
                      const category = categorias.find((cat) => cat.id === supply.categoriaId);
                      return (
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getCategoryClass(category?.id, category?.nombre)}`}>
                          {category?.nombre || `Categoría #${supply.categoriaId || '-'}`}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">{supply.unidadMedida}</td>
                  <td className="px-4 py-3">S/ {Number(supply.precio).toFixed(2)}</td>
                  <td className="px-4 py-3">{supply.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onEdit={() => {
                      setEditingId(supply.id);
                      setForm({ nombre: supply.nombre, precio: Number(supply.precio), stock: Number(supply.stock), unidadMedida: supply.unidadMedida, marcaId: supply.marca?.id, categoriaId: supply.categoriaId || 0 });
                      setOpen(true);
                    }} />
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
            <DialogTitle>{editingId ? 'Editar insumo' : 'Nuevo insumo'}</DialogTitle>
            <DialogDescription>Completa el formulario para registrar el insumo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
            <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            <Input placeholder="Unidad de medida" value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value.toUpperCase() })} />
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={form.marcaId || 0} onChange={(e) => setForm({ ...form, marcaId: Number(e.target.value) || undefined })}>
              <option value={0}>Sin marca</option>
              {marcas.map((brand) => <option key={brand.id} value={brand.id}>{brand.nombre}</option>)}
            </select>
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={form.categoriaId || 0} onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) || 0 })}>
              <option value={0}>Selecciona una categoría</option>
              {categorias.filter((category) => category.id >= 5).map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
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

export default Insumos;