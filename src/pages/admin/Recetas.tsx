import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from '@/pages/admin/components/AdminCrudLayout';
import { RowActions } from '@/pages/admin/components/RowActions';

interface RecetaForm {
  productoId: number;
  insumoId: number;
  cantidad: number;
  unidadMedida: string;
}

const initialForm: RecetaForm = { productoId: 0, insumoId: 0, cantidad: 0, unidadMedida: 'KG' };

export const Recetas: React.FC = () => {
  const { recetas, productos, insumos, fetchRecetas, fetchProductos, fetchInsumos, createReceta, updateReceta } = useAdminStore();
  const [search, setSearch] = useState('');
  const [productoFilter, setProductoFilter] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RecetaForm>(initialForm);

  useEffect(() => {
    fetchRecetas();
    fetchProductos();
    fetchInsumos();
  }, [fetchRecetas, fetchProductos, fetchInsumos]);

  const normalized = useMemo(() => recetas.map((recipe: any) => ({
    id: recipe.id,
    productoId: recipe.productoId ?? recipe.producto?.id,
    productoNombre: recipe.productoNombre ?? recipe.producto?.nombre ?? '-',
    insumoId: recipe.insumoId ?? recipe.insumo?.id,
    insumoNombre: recipe.insumoNombre ?? recipe.insumo?.nombre ?? '-',
    cantidad: Number(recipe.cantidad ?? 0),
    unidadMedida: recipe.unidadMedida ?? '-',
  })), [recetas]);

  const filtered = useMemo(() => normalized.filter((recipe) => {
    const bySearch = `${recipe.productoNombre} ${recipe.insumoNombre}`.toLowerCase().includes(search.toLowerCase());
    const byProduct = productoFilter === 0 || recipe.productoId === productoFilter;
    return bySearch && byProduct;
  }), [normalized, search, productoFilter]);

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      productoId: form.productoId,
      insumosId: [form.insumoId],
      cantidades: [form.cantidad],
      unidadesMedida: [form.unidadMedida],
    };

    if (editingId) {
      await updateReceta(form.productoId, payload as any);
    } else {
      await createReceta(payload as any);
    }

    await fetchRecetas();
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Recetas"
        subtitle="Gestión de recetas (crear y actualizar) para productos preparados."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
        filters={(
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={productoFilter} onChange={(e) => setProductoFilter(Number(e.target.value))}>
            <option value={0}>Todos los productos</option>
            {productos.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}
          </select>
        )}
      >
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">Insumo</th>
                <th className="px-4 py-3 text-left">Cantidad</th>
                <th className="px-4 py-3 text-left">Unidad</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((recipe) => (
                <tr key={recipe.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{recipe.productoNombre}</td>
                  <td className="px-4 py-3">{recipe.insumoNombre}</td>
                  <td className="px-4 py-3">{recipe.cantidad}</td>
                  <td className="px-4 py-3">{recipe.unidadMedida}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      onEdit={() => {
                        setEditingId(recipe.id);
                        setForm({
                          productoId: recipe.productoId,
                          insumoId: recipe.insumoId,
                          cantidad: recipe.cantidad,
                          unidadMedida: recipe.unidadMedida,
                        });
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
            <DialogTitle>{editingId ? 'Editar receta' : 'Nueva receta'}</DialogTitle>
            <DialogDescription>Define el producto, insumo y cantidades para la receta.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={form.productoId} onChange={(e) => setForm({ ...form, productoId: Number(e.target.value) })}>
              <option value={0}>Selecciona producto</option>
              {productos.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}
            </select>
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={form.insumoId} onChange={(e) => setForm({ ...form, insumoId: Number(e.target.value) })}>
              <option value={0}>Selecciona insumo</option>
              {insumos.map((supply) => <option key={supply.id} value={supply.id}>{supply.nombre}</option>)}
            </select>
            <Input type="number" step="0.01" placeholder="Cantidad" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} />
            <Input placeholder="Unidad de medida" value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value.toUpperCase() })} />
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

export default Recetas;