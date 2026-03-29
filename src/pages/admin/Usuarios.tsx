import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UsuarioRequest } from '@/types';

const PAGE_SIZE = 8;
const ROLES = [
  { id: 1, nombre: 'CLIENTE' },{ id: 2, nombre: 'MOZO' },{ id: 3, nombre: 'COCINERO' },{ id: 4, nombre: 'BARTENDER' },
  { id: 5, nombre: 'CAJERO' },{ id: 6, nombre: 'RECEPCIONISTA' },{ id: 7, nombre: 'ALMACENERO' },{ id: 8, nombre: 'ADMINISTRADOR' },
];
const initialForm: UsuarioRequest = { username:'', password:'', tipoUsuario:2, estado:'ACTIVO', rolId:2 };

export const Usuarios: React.FC = () => {
  const { usuarios, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } = useAdminStore();
  const [form, setForm] = useState<UsuarioRequest>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState<number>(0);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchUsuarios(); }, []);

  const filtered = useMemo(() => usuarios.filter((u:any) => {
    const rolNombre = u.rol?.nombre || u.rolNombre || '';
    const matchSearch = (`${u.username} ${rolNombre}`).toLowerCase().includes(search.toLowerCase());
    const matchRol = rolFilter === 0 || (u.rol?.id || u.rolId) === rolFilter;
    return matchSearch && matchRol;
  }), [usuarios, search, rolFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateUsuario(editingId, { ...form, password: undefined });
    else await createUsuario(form);
    setEditingId(null); setForm(initialForm); fetchUsuarios();
  };

  return <MainLayout><div className="space-y-6"><h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
    <Card><CardHeader><CardTitle>Formulario (UsuarioRequest)</CardTitle></CardHeader><CardContent>
      <form onSubmit={guardar} className="grid md:grid-cols-4 gap-2">
        <Input placeholder="username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
        <Input type="password" placeholder="password" value={form.password || ''} onChange={e=>setForm({...form,password:e.target.value})} disabled={!!editingId} />
        <select className="border rounded px-2" value={form.rolId} onChange={e=>setForm({...form,rolId:Number(e.target.value)})}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</select>
        <div className="md:col-span-4 flex gap-2"><Button type="submit">Guardar</Button>{editingId && <Button type="button" variant="outline" onClick={()=>{setEditingId(null);setForm(initialForm);}}>Cancelar</Button>}</div>
      </form>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Listado (UsuarioResponse)</CardTitle></CardHeader><CardContent>
      <div className="flex gap-2 mb-3"><Input placeholder="Buscar" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
        <select className="border rounded px-2" value={rolFilter} onChange={e=>{setRolFilter(Number(e.target.value));setPage(1);}}><option value={0}>Todos los roles</option>{ROLES.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</select>
      </div>
      <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">username</th><th className="p-2 border">rolId</th><th className="p-2 border">rolNombre</th><th className="p-2 border">estado</th><th className="p-2 border">acciones</th></tr></thead>
      <tbody>{rows.map((u:any)=><tr key={u.id}><td className="p-2 border">{u.id}</td><td className="p-2 border">{u.username}</td><td className="p-2 border">{u.rol?.id || u.rolId}</td><td className="p-2 border">{u.rol?.nombre || u.rolNombre || '-'}</td><td className="p-2 border">{u.estado}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={()=>{setEditingId(u.id);setForm({ username:u.username, password:'', tipoUsuario:u.tipoUsuario||2, estado:u.estado||'ACTIVO', rolId:u.rol?.id || u.rolId || 1 });}}>Actualizar</Button> <Button size="sm" variant="destructive" onClick={()=>deleteUsuario(u.id)}>Eliminar</Button></td></tr>)}</tbody></table>
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
    </CardContent></Card>
  </div></MainLayout>;
};

export default Usuarios;