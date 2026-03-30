import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from '@/pages/admin/components/AdminCrudLayout';
import { RowActions } from '@/pages/admin/components/RowActions';
import type { ProductoRequest } from '@/types';

const initialForm: ProductoRequest = { nombre: '', precio: 0, stock: 0, categoriaId: 0, marcaId: undefined };

export const Productos: React.FC = () => {
  const { productos, categorias, marcas, fetchProductos, fetchCategorias, fetchMarcas, createProducto, updateProducto } = useAdminStore();
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductoRequest>(initialForm);

  useEffect(() => { fetchProductos(); fetchCategorias(); fetchMarcas(); }, [fetchProductos, fetchCategorias, fetchMarcas]);

  const filtered = useMemo(() => productos.filter((product) => {
    const bySearch = `${product.nombre} ${product.categoria?.nombre || ''}`.toLowerCase().includes(search.toLowerCase());
    const byCategory = categoriaFilter === 0 || product.categoria?.id === categoriaFilter;
    return bySearch && byCategory;
  }), [productos, search, categoriaFilter]);

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingId) await updateProducto(editingId, form);
    else await createProducto(form);
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
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{product.nombre}<div className="text-xs text-slate-500">Marca: {product.marca?.nombre || 'Sin marca'}</div></td>
                  <td className="px-4 py-3">{product.categoria?.nombre || '-'}</td>
                  <td className="px-4 py-3">S/ {Number(product.precio).toFixed(2)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      onEdit={() => {
                        setEditingId(product.id);
                        setForm({ nombre: product.nombre, precio: Number(product.precio), stock: product.stock, categoriaId: product.categoria?.id || 0, marcaId: product.marca?.id });
                        setOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}>
              <option value={0}>Selecciona una categoría</option>
              {categorias.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
            </select>
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={form.marcaId || 0} onChange={(e) => setForm({ ...form, marcaId: Number(e.target.value) || undefined })}>
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