import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProductoRequest } from '@/types';

const PAGE_SIZE = 6;
const initialForm: ProductoRequest = { nombre:'', precio:0, stock:0, categoriaId:0, marcaId:undefined };

export const Productos: React.FC = () => {
  const { productos, categorias, marcas, fetchProductos, fetchCategorias, fetchMarcas, createProducto, updateProducto } = useAdminStore();
  const [form, setForm] = useState<ProductoRequest>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<number>(0);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchProductos(); fetchCategorias(); fetchMarcas(); }, []);

  const filtered = useMemo(() => productos.filter(p => {
    const matchSearch = (`${p.nombre} ${p.categoria?.nombre || ''}`).toLowerCase().includes(search.toLowerCase());
    const matchCat = categoriaFilter === 0 || p.categoria?.id === categoriaFilter;
    return matchSearch && matchCat;
  }), [productos, search, categoriaFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.categoriaId) return;
    if (editingId) await updateProducto(editingId, form); else await createProducto(form);
    setEditingId(null); setForm(initialForm); fetchProductos();
  };

  return <MainLayout><div className="space-y-6"><h2 className="text-2xl font-bold">Gestión de Productos</h2>
    <Card><CardHeader><CardTitle>Formulario (ProductoRequest)</CardTitle></CardHeader><CardContent>
      <form onSubmit={guardar} className="grid md:grid-cols-5 gap-2">
        <Input placeholder="nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} />
        <Input type="number" step="0.01" placeholder="precio" value={form.precio} onChange={e=>setForm({...form,precio:Number(e.target.value)})} />
        <Input type="number" placeholder="stock" value={form.stock} onChange={e=>setForm({...form,stock:Number(e.target.value)})} />
        <select className="border rounded px-2" value={form.categoriaId} onChange={e=>setForm({...form,categoriaId:Number(e.target.value)})}><option value={0}>categoriaId</option>{categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
        <select className="border rounded px-2" value={form.marcaId || 0} onChange={e=>setForm({...form,marcaId:Number(e.target.value)||undefined})}><option value={0}>sin marca</option>{marcas.map(m=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select>
        <div className="md:col-span-5 flex gap-2"><Button type="submit">Guardar</Button>{editingId && <Button type="button" variant="outline" onClick={()=>{setEditingId(null);setForm(initialForm);}}>Cancelar</Button>}</div>
      </form>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Listado (ProductoResponse)</CardTitle></CardHeader><CardContent>
      <div className="flex gap-2 mb-3"><Input placeholder="Buscar" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
      <select className="border rounded px-2" value={categoriaFilter} onChange={e=>{setCategoriaFilter(Number(e.target.value));setPage(1);}}><option value={0}>Todas categorías</option>{categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
      <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">nombre</th><th className="p-2 border">precio</th><th className="p-2 border">stock</th><th className="p-2 border">categoria</th><th className="p-2 border">marca</th><th className="p-2 border">acciones</th></tr></thead>
      <tbody>{rows.map(p=><tr key={p.id}><td className="p-2 border">{p.id}</td><td className="p-2 border">{p.nombre}</td><td className="p-2 border">{p.precio}</td><td className="p-2 border">{p.stock}</td><td className="p-2 border">{p.categoria?.nombre || '-'}</td><td className="p-2 border">{p.marca?.nombre || '-'}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={()=>{setEditingId(p.id);setForm({ nombre:p.nombre, precio:Number(p.precio), stock:p.stock, categoriaId:p.categoria?.id || 0, marcaId:p.marca?.id });}}>Actualizar</Button></td></tr>)}</tbody></table>
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
    </CardContent></Card>
  </div></MainLayout>;
};

export default Productos;