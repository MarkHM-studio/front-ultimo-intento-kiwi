import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore, useComprobanteStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MesaRequest } from '@/types';

const PAGE_SIZE = 8;

export const Mesas: React.FC = () => {
  const { mesas, fetchMesas, createMesa, updateMesa, deleteMesa } = useAdminStore();
  const { mesasOcupadas, fetchMesasOcupadas } = useComprobanteStore();
  const [form, setForm] = useState<MesaRequest>({ nombre: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchMesas(); fetchMesasOcupadas(); }, []);
  const filtered = useMemo(() => mesas.filter(m => {
    const matchSearch = m.nombre.toLowerCase().includes(search.toLowerCase());
    const matchEstado = estadoFilter === 'TODOS' || m.estado === estadoFilter;
    return matchSearch && matchEstado;
  }), [mesas, search, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateMesa(editingId, form); else await createMesa(form);
    setEditingId(null); setForm({ nombre: '' }); fetchMesas();
  };

  return <MainLayout><div className="space-y-6"><h2 className="text-2xl font-bold">Gestión de Mesas</h2>
    <Card><CardHeader><CardTitle>Formulario (MesaRequest)</CardTitle></CardHeader><CardContent>
      <form className="flex gap-2" onSubmit={guardar}><Input placeholder="nombre" value={form.nombre} onChange={e=>setForm({nombre:e.target.value})} /><Button type="submit">Guardar</Button>{editingId && <Button type="button" variant="outline" onClick={()=>{setEditingId(null);setForm({nombre:''});}}>Cancelar</Button>}</form>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Listado (MesaResponse)</CardTitle></CardHeader><CardContent>
      <div className="flex gap-2 mb-3"><Input placeholder="Buscar por nombre" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
      <select className="border rounded px-2" value={estadoFilter} onChange={e=>{setEstadoFilter(e.target.value);setPage(1);}}><option value="TODOS">Todos</option><option value="OCUPADO">OCUPADO</option><option value="DESOCUPADO">DESOCUPADO</option></select></div>
      <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">nombre</th><th className="p-2 border">estado</th><th className="p-2 border">acciones</th></tr></thead>
      <tbody>{rows.map(m=><tr key={m.id}><td className="p-2 border">{m.id}</td><td className="p-2 border">{m.nombre}</td><td className="p-2 border">{m.estado}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={()=>{setEditingId(m.id);setForm({nombre:m.nombre});}}>Actualizar</Button> <Button size="sm" variant="destructive" onClick={()=>deleteMesa(m.id)}>Eliminar</Button></td></tr>)}</tbody></table>
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Mesas ocupadas</CardTitle></CardHeader><CardContent>
      <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2 border">mesaId</th><th className="p-2 border">nombre</th><th className="p-2 border">grupoId</th><th className="p-2 border">estadoMesa</th><th className="p-2 border">comprobanteId</th><th className="p-2 border">estadoComprobante</th></tr></thead>
      <tbody>{mesasOcupadas.map((m:any)=><tr key={m.mesaId}><td className="p-2 border">{m.mesaId}</td><td className="p-2 border">{m.nombre || m.mesaNombre}</td><td className="p-2 border">{m.grupoId}</td><td className="p-2 border">{m.estadoMesa}</td><td className="p-2 border">{m.comprobanteId}</td><td className="p-2 border">{m.estadoComprobante || '-'}</td></tr>)}</tbody></table>
    </CardContent></Card>
  </div></MainLayout>;
};

export default Mesas;