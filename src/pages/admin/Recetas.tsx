import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 8;

interface RecetaForm {
  productoId: number;
  insumoId: number;
  cantidad: number;
  unidadMedida: string;
}

export const Recetas: React.FC = () => {
  const { recetas, productos, insumos, fetchRecetas, fetchProductos, fetchInsumos, createReceta, updateReceta } = useAdminStore();
  const [form, setForm] = useState<RecetaForm>({ productoId: 0, insumoId: 0, cantidad: 0, unidadMedida: 'KG' });
  const [search, setSearch] = useState('');
  const [productoFilter, setProductoFilter] = useState<number>(0);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchRecetas(); fetchProductos(); fetchInsumos(); }, []);

  const normalized = useMemo(() => recetas.map((r: any) => ({
    id: r.id,
    productoId: r.productoId ?? r.producto?.id,
    productoNombre: r.productoNombre ?? r.producto?.nombre ?? 'N/A',
    insumoId: r.insumoId ?? r.insumo?.id,
    insumoNombre: r.insumoNombre ?? r.insumo?.nombre ?? 'N/A',
    cantidad: Number(r.cantidad ?? 0),
    unidadMedida: r.unidadMedida ?? '',
  })), [recetas]);

  const filtered = useMemo(() => normalized.filter(r => {
    const matchSearch = (r.productoNombre + ' ' + r.insumoNombre).toLowerCase().includes(search.toLowerCase());
    const matchProducto = productoFilter === 0 || r.productoId === productoFilter;
    return matchSearch && matchProducto;
  }), [normalized, search, productoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productoId || !form.insumoId || !form.cantidad || !form.unidadMedida) return;
    await createReceta({
      productoId: form.productoId,
      insumoId: form.insumoId,
      cantidad: form.cantidad,
      unidadMedida: form.unidadMedida,
    } as any);
    setForm({ productoId: 0, insumoId: 0, cantidad: 0, unidadMedida: 'KG' });
    fetchRecetas();
  };

  const actualizarProducto = async (productoId: number) => {
    const recetasProducto = normalized
      .filter(r => r.productoId === productoId)
      .map(r => ({ productoId: r.productoId, insumoId: r.insumoId, cantidad: r.cantidad, unidadMedida: r.unidadMedida }));
    if (recetasProducto.length === 0) return;
    await updateReceta(productoId, recetasProducto as any);
    fetchRecetas();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Recetas</h2>

        <Card><CardHeader><CardTitle>Formulario (RecetaRequest)</CardTitle></CardHeader><CardContent>
          <form onSubmit={guardar} className="grid md:grid-cols-4 gap-2">
            <select className="border rounded px-2" value={form.productoId} onChange={(e) => setForm({ ...form, productoId: Number(e.target.value) })}>
              <option value={0}>productoId</option>{productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select className="border rounded px-2" value={form.insumoId} onChange={(e) => setForm({ ...form, insumoId: Number(e.target.value) })}>
              <option value={0}>insumoId</option>{insumos.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
            <Input type="number" step="0.01" placeholder="cantidad" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} />
            <Input placeholder="unidadMedida" value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} />
            <div className="md:col-span-4"><Button type="submit">Guardar</Button></div>
          </form>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Listado (RecetaResponse)</CardTitle></CardHeader><CardContent>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Buscar por producto o insumo" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} />
            <select className="border rounded px-2" value={productoFilter} onChange={(e)=>{setProductoFilter(Number(e.target.value));setPage(1);}}>
              <option value={0}>Todos los productos</option>{productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <table className="w-full text-sm border">
            <thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">productoId</th><th className="p-2 border">productoNombre</th><th className="p-2 border">insumoId</th><th className="p-2 border">insumoNombre</th><th className="p-2 border">cantidad</th><th className="p-2 border">unidadMedida</th><th className="p-2 border">acciones</th></tr></thead>
            <tbody>{rows.map(r => <tr key={r.id}><td className="p-2 border">{r.id}</td><td className="p-2 border">{r.productoId}</td><td className="p-2 border">{r.productoNombre}</td><td className="p-2 border">{r.insumoId}</td><td className="p-2 border">{r.insumoNombre}</td><td className="p-2 border">{r.cantidad}</td><td className="p-2 border">{r.unidadMedida}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={()=>{setForm({ productoId: r.productoId, insumoId: r.insumoId, cantidad: r.cantidad, unidadMedida: r.unidadMedida });}}>Actualizar</Button> <Button size="sm" variant="secondary" onClick={()=>actualizarProducto(r.productoId)}>Guardar update producto</Button></td></tr>)}</tbody>
          </table>
          <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
        </CardContent></Card>
      </div>
    </MainLayout>
  );
};

export default Recetas;