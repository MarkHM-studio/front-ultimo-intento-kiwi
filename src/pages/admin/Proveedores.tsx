import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProveedorRequest } from '@/types';

const PAGE_SIZE = 6;
const initialForm: ProveedorRequest = { contacto:'', razonSocial:'', ruc:'', direccion:'', telefono:'', correo:'' };

export const Proveedores: React.FC = () => {
  const { proveedores, fetchProveedores, createProveedor, updateProveedor } = useAdminStore();
  const [form, setForm] = useState<ProveedorRequest>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchProveedores(); }, []);
  const filtered = useMemo(() => proveedores.filter(p => (`${p.razonSocial} ${p.ruc} ${p.contacto}`).toLowerCase().includes(search.toLowerCase())), [proveedores, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const guardar = async (e: React.FormEvent) => { e.preventDefault(); if (editingId) await updateProveedor(editingId, form); else await createProveedor(form); setForm(initialForm); setEditingId(null); fetchProveedores(); };

  return <MainLayout><div className="space-y-6"><h2 className="text-2xl font-bold">Gestión de Proveedores</h2>
    <Card><CardHeader><CardTitle>Formulario (ProveedorRequest)</CardTitle></CardHeader><CardContent>
      <form onSubmit={guardar} className="grid md:grid-cols-3 gap-2">
        <Input placeholder="contacto" value={form.contacto} onChange={e=>setForm({...form,contacto:e.target.value})} />
        <Input placeholder="razonSocial" value={form.razonSocial} onChange={e=>setForm({...form,razonSocial:e.target.value})} />
        <Input placeholder="ruc" value={form.ruc} onChange={e=>setForm({...form,ruc:e.target.value})} />
        <Input placeholder="direccion" value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} />
        <Input placeholder="telefono" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} />
        <Input placeholder="correo" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})} />
        <div className="md:col-span-3 flex gap-2"><Button type="submit">Guardar</Button>{editingId && <Button type="button" variant="outline" onClick={()=>{setEditingId(null);setForm(initialForm);}}>Cancelar</Button>}</div>
      </form>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Listado (ProveedorResponse)</CardTitle></CardHeader><CardContent>
      <Input className="mb-3" placeholder="Buscar" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
      <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">contacto</th><th className="p-2 border">razonSocial</th><th className="p-2 border">ruc</th><th className="p-2 border">telefono</th><th className="p-2 border">correo</th><th className="p-2 border">estado</th><th className="p-2 border">acciones</th></tr></thead>
      <tbody>{rows.map(p=><tr key={p.id}><td className="p-2 border">{p.id}</td><td className="p-2 border">{p.contacto}</td><td className="p-2 border">{p.razonSocial}</td><td className="p-2 border">{p.ruc}</td><td className="p-2 border">{p.telefono}</td><td className="p-2 border">{p.correo}</td><td className="p-2 border">{(p as any).estado || '-'}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={()=>{setEditingId(p.id);setForm({ contacto:p.contacto, razonSocial:p.razonSocial, ruc:p.ruc, direccion:p.direccion, telefono:p.telefono, correo:p.correo });}}>Actualizar</Button></td></tr>)}</tbody></table>
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
    </CardContent></Card>
  </div></MainLayout>;
};

export default Proveedores;