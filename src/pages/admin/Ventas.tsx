import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useComprobanteStore } from '@/stores';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Ventas: React.FC = () => {
  const { comprobantes, comprobanteActual, fetchComprobantes, fetchComprobanteById } = useComprobanteStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('TODOS');

  useEffect(() => { fetchComprobantes(); }, [fetchComprobantes]);

  const filtered = useMemo(() => comprobantes.filter((voucher) => {
    const date = (voucher.fechaHoraVenta || voucher.fechaHoraApertura || '').slice(0, 10);
    const bySearch = `${voucher.id} ${voucher.total} ${date}`.toLowerCase().includes(search.toLowerCase());
    const byStatus = status === 'TODOS' || voucher.estado === status;
    return bySearch && byStatus;
  }), [comprobantes, search, status]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Ventas</h2>
          <p className="mt-1 text-sm text-white/80">Visualiza comprobantes y consulta el detalle individual de cada venta.</p>
        </section>

        <Card className="rounded-2xl p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input placeholder="Buscar por ID, total o fecha" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="TODOS">Todos los estados</option>
              <option value="ABIERTO">Abierto</option>
              <option value="PAGADO">Pagado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Comprobante</th>
                <th className="px-4 py-3 text-left">Fecha venta</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((voucher) => (
                <tr key={voucher.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">Comprobante #{voucher.id}</td>
                  <td className="px-4 py-3">{voucher.fechaHoraVenta || '-'}</td>
                  <td className="px-4 py-3">S/ {Number(voucher.total).toFixed(2)}</td>
                  <td className="px-4 py-3">{voucher.estado}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => fetchComprobanteById(voucher.id)}>Ver detalle</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="rounded-2xl p-5">
          <h3 className="mb-3 text-base font-semibold">Detalle seleccionado</h3>
          {!comprobanteActual ? (
            <p className="text-sm text-slate-500">Selecciona un comprobante para visualizar el detalle.</p>
          ) : (
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <p><strong>ID:</strong> {comprobanteActual.id}</p>
              <p><strong>Estado:</strong> {comprobanteActual.estado}</p>
              <p><strong>Total:</strong> S/ {Number(comprobanteActual.total).toFixed(2)}</p>
              <p><strong>IGV:</strong> S/ {Number(comprobanteActual.igv).toFixed(2)}</p>
              <p className="md:col-span-2"><strong>Fecha de venta:</strong> {comprobanteActual.fechaHoraVenta || '-'}</p>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default Ventas;