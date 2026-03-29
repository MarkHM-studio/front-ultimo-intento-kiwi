import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MarcaRequest } from '@/types';

const PAGE_SIZE = 6;

export const Marcas: React.FC = () => {
  const { marcas, fetchMarcas, createMarca, updateMarca, isLoading } = useAdminStore();
  const [form, setForm] = useState<MarcaRequest>({ nombre: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchMarcas(); }, []);
  const filtered = useMemo(() => marcas.filter(m => m.nombre.toLowerCase().includes(search.toLowerCase())), [marcas, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    if (editingId) await updateMarca(editingId, form);
    else await createMarca(form);
    setForm({ nombre: '' });
    setEditingId(null);
    fetchMarcas();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Marcas</h2>
        <Card><CardHeader><CardTitle>Formulario (request: nombre)</CardTitle></CardHeader><CardContent>
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input placeholder="nombre" value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} />
            <Button type="submit" disabled={isLoading}>Guardar</Button>
            {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ nombre: '' }); }}>Cancelar</Button>}
          </form>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Listado</CardTitle></CardHeader><CardContent>
          <Input className="mb-3" placeholder="Buscar por nombre" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <table className="w-full text-sm border">
            <thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">nombre</th><th className="p-2 border">registro</th><th className="p-2 border">actualización</th><th className="p-2 border">acciones</th></tr></thead>
            <tbody>{rows.map(m => <tr key={m.id}><td className="p-2 border">{m.id}</td><td className="p-2 border">{m.nombre}</td><td className="p-2 border">{m.fechaHoraRegistro}</td><td className="p-2 border">{m.fechaHoraActualizacion}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={() => { setEditingId(m.id); setForm({ nombre: m.nombre }); }}>Actualizar</Button></td></tr>)}</tbody>
          </table>
          <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span className="text-sm">{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
        </CardContent></Card>
      </div>
    </MainLayout>
  );
};

export default Marcas;