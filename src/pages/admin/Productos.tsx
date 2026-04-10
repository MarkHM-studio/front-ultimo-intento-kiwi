import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from '@/pages/admin/components/AdminCrudLayout';
import { RowActions } from '@/pages/admin/components/RowActions';
import type { ProductoRequest } from '@/types';
import { useTablePagination } from '@/hooks/useTablePagination';
import { TablePagination } from '@/pages/admin/components/TablePagination';
import { getCategoryClass, getProductType, getProductTypeClass } from '@/pages/admin/components/categoryUtils';

const initialForm: ProductoRequest = { nombre: '', precio: 0, stock: 0, categoriaId: 0, marcaId: undefined };
const PREPARED_CATEGORY_IDS = [1, 2];

export const Productos: React.FC = () => {
  const { productos, categorias, marcas, fetchProductos, fetchCategorias, fetchMarcas, createProducto, updateProducto } = useAdminStore();
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductoRequest>(initialForm);
  const isStockLocked = form.categoriaId === 0 || PREPARED_CATEGORY_IDS.includes(form.categoriaId);

  useEffect(() => { fetchProductos(); fetchCategorias(); fetchMarcas(); }, [fetchProductos, fetchCategorias, fetchMarcas]);

  const filtered = useMemo(() => productos.filter((product) => {
    const bySearch = `${product.nombre} ${product.categoria?.nombre || ''}`.toLowerCase().includes(search.toLowerCase());
    const byCategory = categoriaFilter === 0 || product.categoria?.id === categoriaFilter;
    return bySearch && byCategory;
  }), [productos, search, categoriaFilter]);
  const { paginatedData, currentPage, totalPages, totalItems, pageSize, setCurrentPage, setPageSize } = useTablePagination(filtered);

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: ProductoRequest = PREPARED_CATEGORY_IDS.includes(form.categoriaId)
      ? { ...form, stock: 0, marcaId: undefined }
      : form;
    if (editingId) await updateProducto(editingId, payload);
    else await createProducto(payload);
    await fetchProductos();
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Productos"
        subtitle="Listado y mantenimiento de productos (crear y actualizar)."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
        filters={(
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={categoriaFilter} onChange={(e) => setCategoriaFilter(Number(e.target.value))}>
            <option value={0}>Todas las categorías</option>
            {categorias.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
          </select>
        )}
      >
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((product) => (
                <tr key={product.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{product.nombre}<div className="text-xs text-slate-500">Marca: {product.marca?.nombre || 'Sin marca'}</div></td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getCategoryClass(product.categoria?.id, product.categoria?.nombre)}`}>
                      {product.categoria?.nombre || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const tipo = getProductType(product.categoria);
                      return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getProductTypeClass(tipo)}`}>{tipo}</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3">S/ {Number(product.precio).toFixed(2)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      onEdit={() => {
                        setEditingId(product.id);
                        const categoriaId = product.categoria?.id || 0;
                        setForm({
                          nombre: product.nombre,
                          precio: Number(product.precio),
                          stock: PREPARED_CATEGORY_IDS.includes(categoriaId) ? 0 : product.stock,
                          categoriaId,
                          marcaId: PREPARED_CATEGORY_IDS.includes(categoriaId) ? undefined : product.marca?.id,
                        });
                        setOpen(true);
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
            <DialogTitle>{editingId ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
            <DialogDescription>Completa los datos según las reglas de categoría y stock.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
            <Input
              type="number"
              placeholder="Stock"
              value={form.stock}
              disabled={isStockLocked}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
            <select
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
              value={form.categoriaId}
              onChange={(e) => {
                const categoriaId = Number(e.target.value);
                const lockedByCategory = PREPARED_CATEGORY_IDS.includes(categoriaId);
                setForm((previous) => ({
                  ...previous,
                  categoriaId,
                  stock: lockedByCategory ? 0 : previous.stock,
                  marcaId: lockedByCategory ? undefined : previous.marcaId,
                }));
              }}
            >
              <option value={0}>Selecciona una categoría</option>
              {categorias.filter((category) => category.id <= 4).map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
            </select>
            <select
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
              value={form.marcaId || 0}
              disabled={PREPARED_CATEGORY_IDS.includes(form.categoriaId)}
              onChange={(e) => setForm({ ...form, marcaId: Number(e.target.value) || undefined })}
            >
              <option value={0}>Sin marca</option>
              {marcas.map((brand) => <option key={brand.id} value={brand.id}>{brand.nombre}</option>)}
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

export default Productos;