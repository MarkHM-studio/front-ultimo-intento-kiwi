import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { RecetaRequest } from '@/types';

const initialForm: RecetaRequest = {
  cantidad: 0,
  unidadMedida: 'KG',
  productoId: 0,
  insumoId: 0,
};

export const Recetas: React.FC = () => {
  const { recetas, productos, insumos, fetchRecetas, fetchProductos, fetchInsumos, createReceta, updateReceta } = useAdminStore();
  const [form, setForm] = useState<RecetaRequest>(initialForm);

  useEffect(() => {
    fetchRecetas();
    fetchProductos();
    fetchInsumos();
  }, []);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReceta(form);
    setForm(initialForm);
  };

  const actualizarPorProducto = async (productoId: number) => {
    const recetasProducto = recetas
      .filter((r) => r.producto.id === productoId)
      .map((r) => ({ cantidad: r.cantidad, unidadMedida: r.unidadMedida, productoId: r.producto.id, insumoId: r.insumo.id }));
    if (recetasProducto.length > 0) {
      await updateReceta(productoId, recetasProducto);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Recetas</h2>
        <Card>
          <CardHeader><CardTitle>Nueva receta</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={crear} className="grid md:grid-cols-4 gap-2">
              <Input type="number" step="0.01" placeholder="Cantidad" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} />
              <Input placeholder="Unidad" value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} />
              <select className="border rounded px-2" value={form.productoId} onChange={(e) => setForm({ ...form, productoId: Number(e.target.value) })}>
                <option value={0}>Producto</option>
                {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <select className="border rounded px-2" value={form.insumoId} onChange={(e) => setForm({ ...form, insumoId: Number(e.target.value) })}>
                <option value={0}>Insumo</option>
                {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
              <div className="md:col-span-4">
                <Button type="submit">Crear receta</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Listado de recetas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recetas.map((r) => (
                <div key={r.id} className="border rounded p-3 flex justify-between items-center">
                  <span>
                    {r.producto?.nombre || 'Producto sin nombre'} - {r.insumo?.nombre || 'Insumo sin nombre'} - {r.cantidad} {r.unidadMedida}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => r.producto?.id && actualizarPorProducto(r.producto.id)}
                    disabled={!r.producto?.id}
                  >
                    Actualizar producto
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Recetas;