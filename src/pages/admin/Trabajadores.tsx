import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TrabajadorRequest } from '@/types';

const PAGE_SIZE = 6;
const initialForm: TrabajadorRequest = { nombre:'', apellido:'', dni:'', telefono:'', correo:'', fechaInicio:'', fechaFin:'', usuarioId:1, tipoJornadaId:1, turnoId:1 };

export const Trabajadores: React.FC = () => {
  const { trabajadores, fetchTrabajadores, createTrabajador, updateTrabajador, deleteTrabajador } = useAdminStore();
  const [form, setForm] = useState<TrabajadorRequest>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchTrabajadores(); }, []);
  const filtered = useMemo(() => trabajadores.filter(t => (`${t.nombre} ${t.apellido} ${t.dni}`).toLowerCase().includes(search.toLowerCase())), [trabajadores, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateTrabajador(editingId, form); else await createTrabajador(form);
    setEditingId(null); setForm(initialForm); fetchTrabajadores();
  };

  return <MainLayout><div className="space-y-6"><h2 className="text-2xl font-bold">Gestión de Trabajadores</h2>
    <Card><CardHeader><CardTitle>Formulario (TrabajadorRequest)</CardTitle></CardHeader><CardContent>
      <form onSubmit={guardar} className="grid md:grid-cols-4 gap-2">
        <Input placeholder="nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} />
        <Input placeholder="apellido" value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} />
        <Input placeholder="dni" value={form.dni} onChange={e=>setForm({...form,dni:e.target.value})} />
        <Input placeholder="telefono" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} />
        <Input placeholder="correo" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})} />
        <Input type="date" value={form.fechaInicio} onChange={e=>setForm({...form,fechaInicio:e.target.value})} />
        <Input type="date" value={form.fechaFin || ''} onChange={e=>setForm({...form,fechaFin:e.target.value})} />
        <Input type="number" placeholder="usuarioId" value={form.usuarioId} onChange={e=>setForm({...form,usuarioId:Number(e.target.value)})} />
        <Input type="number" placeholder="tipoJornadaId" value={form.tipoJornadaId} onChange={e=>setForm({...form,tipoJornadaId:Number(e.target.value)})} />
        <Input type="number" placeholder="turnoId" value={form.turnoId} onChange={e=>setForm({...form,turnoId:Number(e.target.value)})} />
        <div className="md:col-span-4 flex gap-2"><Button type="submit">Guardar</Button>{editingId && <Button type="button" variant="outline" onClick={()=>{setEditingId(null);setForm(initialForm);}}>Cancelar</Button>}</div>
      </form>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Listado (TrabajadorResponse)</CardTitle></CardHeader><CardContent>
      <Input className="mb-3" placeholder="Buscar" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
      <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">nombre</th><th className="p-2 border">apellido</th><th className="p-2 border">dni</th><th className="p-2 border">correo</th><th className="p-2 border">acciones</th></tr></thead>
      <tbody>{rows.map(t=><tr key={t.id}><td className="p-2 border">{t.id}</td><td className="p-2 border">{t.nombre}</td><td className="p-2 border">{t.apellido}</td><td className="p-2 border">{t.dni}</td><td className="p-2 border">{t.correo}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={()=>{setEditingId(t.id);setForm({ nombre:t.nombre, apellido:t.apellido, dni:t.dni, telefono:t.telefono, correo:t.correo, fechaInicio:t.fechaInicio, fechaFin:t.fechaFin, usuarioId:t.usuario.id, tipoJornadaId:t.tipoJornada.id, turnoId:t.turno.id });}}>Actualizar</Button> <Button size="sm" variant="destructive" onClick={()=>deleteTrabajador(t.id)}>Eliminar</Button></td></tr>)}</tbody></table>
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
    </CardContent></Card>
  </div></MainLayout>;
};

export default Trabajadores;