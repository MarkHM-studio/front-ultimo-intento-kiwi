import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ClienteRequest } from '@/types';

const PAGE_SIZE = 6;
const initialForm: ClienteRequest = { nombre:'', apellido:'', fechaNacimiento:'', telefono:'', correo:'', distritoId:1, usuarioId:1 };

export const Clientes: React.FC = () => {
  const { clientes, fetchClientes, createCliente, updateCliente, deleteCliente } = useAdminStore();
  const [form, setForm] = useState<ClienteRequest>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchClientes(); }, []);
  const filtered = useMemo(() => clientes.filter(c => (`${c.nombre} ${c.apellido} ${c.correo}`).toLowerCase().includes(search.toLowerCase())), [clientes, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateCliente(editingId, form);
    else await createCliente(form);
    setForm(initialForm); setEditingId(null); fetchClientes();
  };

  return <MainLayout><div className="space-y-6"><h2 className="text-2xl font-bold">Gestión de Clientes</h2>
    <Card><CardHeader><CardTitle>Formulario (ClienteRequest)</CardTitle></CardHeader><CardContent>
      <form onSubmit={guardar} className="grid md:grid-cols-4 gap-2">
        <Input placeholder="nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} />
        <Input placeholder="apellido" value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} />
        <Input type="date" value={form.fechaNacimiento} onChange={e=>setForm({...form,fechaNacimiento:e.target.value})} />
        <Input placeholder="telefono" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} />
        <Input placeholder="correo" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})} />
        <Input type="number" placeholder="distritoId" value={form.distritoId} onChange={e=>setForm({...form,distritoId:Number(e.target.value)})} />
        <Input type="number" placeholder="usuarioId" value={form.usuarioId} onChange={e=>setForm({...form,usuarioId:Number(e.target.value)})} />
        <div className="md:col-span-4 flex gap-2"><Button type="submit">Guardar</Button>{editingId && <Button type="button" variant="outline" onClick={()=>{setEditingId(null);setForm(initialForm);}}>Cancelar</Button>}</div>
      </form>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Listado (ClienteResponse)</CardTitle></CardHeader><CardContent>
      <Input className="mb-3" placeholder="Buscar" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
      <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">nombre</th><th className="p-2 border">apellido</th><th className="p-2 border">correo</th><th className="p-2 border">telefono</th><th className="p-2 border">distrito</th><th className="p-2 border">acciones</th></tr></thead>
      <tbody>{rows.map(c=><tr key={c.id}><td className="p-2 border">{c.id}</td><td className="p-2 border">{c.nombre}</td><td className="p-2 border">{c.apellido}</td><td className="p-2 border">{c.correo}</td><td className="p-2 border">{c.telefono}</td><td className="p-2 border">{(c as any).distrito?.nombre || (c as any).distrito || '-'}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={()=>{setEditingId(c.id);setForm({ nombre:c.nombre, apellido:c.apellido, fechaNacimiento:c.fechaNacimiento, telefono:c.telefono, correo:c.correo, distritoId:(c as any).distrito?.id||1, usuarioId:(c as any).usuario?.id||1 });}}>Actualizar</Button> <Button size="sm" variant="destructive" onClick={()=>deleteCliente(c.id)}>Eliminar</Button></td></tr>)}</tbody></table>
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
    </CardContent></Card>
  </div></MainLayout>;
};

export default Clientes;