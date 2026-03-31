import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from './components/AdminCrudLayout';
import { RowActions } from './components/RowActions';
import type { RecetaRequest } from '@/types';

interface RecetaDetalle {
  insumoId: number;
  cantidad: number;
  unidadMedida: string;
}

const emptyDetalle: RecetaDetalle = { insumoId: 0, cantidad: 0, unidadMedida: '' };

export const Recetas: React.FC = () => {
  const { recetas, productos, insumos, fetchRecetas, fetchProductos, fetchInsumos, createReceta, updateReceta } = useAdminStore();
  const [search, setSearch] = useState('');
  const [productoFilter, setProductoFilter] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingProductoId, setEditingProductoId] = useState<number | null>(null);
  const [productoId, setProductoId] = useState(0);
  const [detalles, setDetalles] = useState<RecetaDetalle[]>([{ ...emptyDetalle }]);
  const getUnidadByInsumo = (insumoId: number) => insumos.find((item) => item.id === insumoId)?.unidadMedida?.toUpperCase() || '';

  useEffect(() => {
    fetchRecetas();
    fetchProductos();
    fetchInsumos();
  }, [fetchRecetas, fetchProductos, fetchInsumos]);

  const normalized = useMemo(() => recetas.map((recipe: any) => ({
    id: recipe.id,
    productoId: Number(recipe.productoId ?? recipe.producto?.id),
    productoNombre: recipe.productoNombre ?? recipe.producto?.nombre ?? '-',
    insumoId: Number(recipe.insumoId ?? recipe.insumo?.id),
    insumoNombre: recipe.insumoNombre ?? recipe.insumo?.nombre ?? '-',
    cantidad: Number(recipe.cantidad ?? 0),
    unidadMedida: recipe.unidadMedida ?? '-',
  })), [recetas]);

  const grouped = useMemo(() => {
    const map = new Map<number, { productoNombre: string; detalles: typeof normalized }>();
    normalized.forEach((item) => {
      const current = map.get(item.productoId);
      if (!current) {
        map.set(item.productoId, { productoNombre: item.productoNombre, detalles: [item] });
      } else {
        current.detalles.push(item);
      }
    });
    return Array.from(map.entries()).map(([key, value]) => ({
      productoId: key,
      productoNombre: value.productoNombre,
      detalles: value.detalles,
    }));
  }, [normalized]);

  const filtered = useMemo(() => grouped.filter((recipeGroup) => {
    const text = `${recipeGroup.productoNombre} ${recipeGroup.detalles.map((d) => d.insumoNombre).join(' ')}`.toLowerCase();
    const bySearch = text.includes(search.toLowerCase());
    const byProducto = productoFilter === 0 || recipeGroup.productoId === productoFilter;
    return bySearch && byProducto;
  }), [grouped, search, productoFilter]);

  const resetForm = () => {
    setOpen(false);
    setEditingProductoId(null);
    setProductoId(0);
    setDetalles([{ ...emptyDetalle }]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: RecetaRequest = {
      productoId,
      insumosId: detalles.map((item) => item.insumoId),
      cantidades: detalles.map((item) => item.cantidad),
      unidadesMedida: detalles.map((item) => getUnidadByInsumo(item.insumoId) || item.unidadMedida.toUpperCase()),
    };

    if (editingProductoId) {
      await updateReceta(editingProductoId, payload);
    } else {
      await createReceta(payload);
    }

    await fetchRecetas();
    resetForm();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Recetas"
        subtitle="Registra la receta de un producto como conjunto de múltiples insumos, cantidades y unidades."
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
                <th className="px-4 py-3 text-left">Detalle receta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((recipeGroup) => (
                <tr key={recipeGroup.productoId} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{recipeGroup.productoNombre}</td>
                  <td className="px-4 py-3">
                    <ul className="space-y-1">
                      {recipeGroup.detalles.map((detail) => (
                        <li key={detail.id}>
                          {detail.insumoNombre} — {detail.cantidad} {detail.unidadMedida}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      onEdit={() => {
                        setEditingProductoId(recipeGroup.productoId);
                        setProductoId(recipeGroup.productoId);
                        setDetalles(recipeGroup.detalles.map((detail) => ({
                          insumoId: detail.insumoId,
                          cantidad: detail.cantidad,
                          unidadMedida: detail.unidadMedida,
                        })));
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingProductoId ? 'Actualizar receta' : 'Nueva receta'}</DialogTitle>
            <DialogDescription>
              Cada receta se registra enviando `productoId`, `insumosId[]`, `cantidades[]` y `unidadesMedida[]` con igual tamaño.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-3">
            <select className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" value={productoId} disabled={!!editingProductoId} onChange={(e) => setProductoId(Number(e.target.value))}>
              <option value={0}>Selecciona producto</option>
              {productos.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}
            </select>

            {detalles.map((detalle, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-4">
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={detalle.insumoId}
                  onChange={(e) => {
                    const insumoId = Number(e.target.value);
                    setDetalles((previous) => previous.map((item, i) =>
                      i === index ? { ...item, insumoId, unidadMedida: getUnidadByInsumo(insumoId) } : item,
                    ));
                  }}
                >
                  <option value={0}>Insumo</option>
                  {insumos.map((supply) => <option key={supply.id} value={supply.id}>{supply.nombre}</option>)}
                </select>
                <Input type="number" step="0.01" placeholder="Cantidad" value={detalle.cantidad} onChange={(e) => setDetalles((previous) => previous.map((item, i) => i === index ? { ...item, cantidad: Number(e.target.value) } : item))} />
                <Input placeholder="Unidad" disabled value={getUnidadByInsumo(detalle.insumoId) || detalle.unidadMedida || '-'} />
                <Button type="button" variant="outline" disabled={detalles.length === 1} onClick={() => setDetalles((previous) => previous.filter((_, i) => i !== index))}>Quitar</Button>
              </div>
            ))}

            <Button type="button" variant="secondary" onClick={() => setDetalles((previous) => [...previous, { ...emptyDetalle }])}>Agregar insumo</Button>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Guardar receta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Recetas;