import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InsumoRequest } from '@/types';

const PAGE_SIZE = 6;

export const Insumos: React.FC = () => {
  const { insumos, marcas, fetchInsumos, fetchMarcas, createInsumo, updateInsumo, isLoading } = useAdminStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [unidadFilter, setUnidadFilter] = useState('TODOS');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<InsumoRequest>({ nombre: '', precio: 0, stock: 0, unidadMedida: 'KG', marcaId: undefined });

  useEffect(() => { fetchInsumos(); fetchMarcas(); }, []);

  const filtered = useMemo(() => insumos.filter(i => {
    const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase());
    const matchUnidad = unidadFilter === 'TODOS' || i.unidadMedida === unidadFilter;
    return matchSearch && matchUnidad;
  }), [insumos, search, unidadFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateInsumo(editingId, form, true);
    else await createInsumo(form);
    setEditingId(null);
    setForm({ nombre: '', precio: 0, stock: 0, unidadMedida: 'KG', marcaId: undefined });
    fetchInsumos();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Insumos</h2>
        <Card><CardHeader><CardTitle>Formulario (InsumoRequest)</CardTitle></CardHeader><CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-5 gap-2">
            <Input placeholder="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input type="number" step="0.01" placeholder="precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
            <Input type="number" step="0.01" placeholder="stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            <Input placeholder="unidadMedida" value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} />
            <select className="border rounded px-2" value={form.marcaId || 0} onChange={(e) => setForm({ ...form, marcaId: Number(e.target.value) || undefined })}>
              <option value={0}>sin marca</option>
              {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <div className="md:col-span-5 flex gap-2">
              <Button type="submit" disabled={isLoading}>Guardar</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ nombre: '', precio: 0, stock: 0, unidadMedida: 'KG', marcaId: undefined }); }}>Cancelar</Button>}
            </div>
          </form>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Listado (InsumoResponse)</CardTitle></CardHeader><CardContent>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Buscar por nombre" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <select className="border rounded px-2" value={unidadFilter} onChange={(e) => { setUnidadFilter(e.target.value); setPage(1); }}>
              <option value="TODOS">Todas unidades</option><option value="KG">KG</option><option value="L">L</option><option value="UDS">UDS</option>
            </select>
          </div>
          <table className="w-full text-sm border">
            <thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">nombre</th><th className="p-2 border">precio</th><th className="p-2 border">stock</th><th className="p-2 border">unidadMedida</th><th className="p-2 border">marcaId</th><th className="p-2 border">acciones</th></tr></thead>
            <tbody>{rows.map(i => <tr key={i.id}><td className="p-2 border">{i.id}</td><td className="p-2 border">{i.nombre}</td><td className="p-2 border">{i.precio}</td><td className="p-2 border">{i.stock}</td><td className="p-2 border">{i.unidadMedida}</td><td className="p-2 border">{i.marca?.id || '-'}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={() => { setEditingId(i.id); setForm({ nombre: i.nombre, precio: Number(i.precio), stock: Number(i.stock), unidadMedida: i.unidadMedida, marcaId: i.marca?.id }); }}>Actualizar</Button></td></tr>)}</tbody>
          </table>
          <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
        </CardContent></Card>
      </div>
    </MainLayout>
  );
};

export default Insumos;