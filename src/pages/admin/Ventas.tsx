import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useComprobanteStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 8;

export const Ventas: React.FC = () => {
  const { comprobantes, comprobanteActual, fetchComprobantes, fetchComprobanteById } = useComprobanteStore();
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchComprobantes(); }, []);

  const filtered = useMemo(() => comprobantes.filter(c => {
    const matchSearch = `${c.id} ${c.total}`.toLowerCase().includes(search.toLowerCase());
    const matchEstado = estadoFilter === 'TODOS' || c.estado === estadoFilter;
    return matchSearch && matchEstado;
  }), [comprobantes, search, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  return <MainLayout><div className="space-y-6"><h2 className="text-2xl font-bold">Visualización de Comprobantes</h2>
    <Card><CardHeader><CardTitle>Comprobantes (solo lectura)</CardTitle></CardHeader><CardContent>
      <div className="flex gap-2 mb-3"><Input placeholder="Buscar por id o total" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
        <select className="border rounded px-2" value={estadoFilter} onChange={e=>{setEstadoFilter(e.target.value);setPage(1);}}><option value="TODOS">Todos</option><option value="ABIERTO">ABIERTO</option><option value="PAGADO">PAGADO</option><option value="CANCELADO">CANCELADO</option></select>
      </div>
      <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2 border">id</th><th className="p-2 border">total</th><th className="p-2 border">IGV</th><th className="p-2 border">fechaHora_venta</th><th className="p-2 border">estado</th><th className="p-2 border">acciones</th></tr></thead>
      <tbody>{rows.map(c=><tr key={c.id}><td className="p-2 border">{c.id}</td><td className="p-2 border">{c.total}</td><td className="p-2 border">{(c as any).IGV ?? c.igv}</td><td className="p-2 border">{(c as any).fechaHora_venta ?? c.fechaHoraVenta ?? '-'}</td><td className="p-2 border">{c.estado}</td><td className="p-2 border"><Button size="sm" variant="outline" onClick={()=>fetchComprobanteById(c.id)}>Ver detalle</Button></td></tr>)}</tbody></table>
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</Button><span>{page}/{totalPages}</span><Button variant="outline" size="sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</Button></div>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Detalle seleccionado</CardTitle></CardHeader><CardContent>
      {!comprobanteActual ? <p className="text-gray-500">Selecciona un comprobante.</p> :
      <table className="w-full text-sm border"><tbody>
        <tr><td className="p-2 border font-medium">id</td><td className="p-2 border">{comprobanteActual.id}</td></tr>
        <tr><td className="p-2 border font-medium">total</td><td className="p-2 border">{comprobanteActual.total}</td></tr>
        <tr><td className="p-2 border font-medium">estado</td><td className="p-2 border">{comprobanteActual.estado}</td></tr>
      </tbody></table>}
    </CardContent></Card>
  </div></MainLayout>;
};

export default Ventas;