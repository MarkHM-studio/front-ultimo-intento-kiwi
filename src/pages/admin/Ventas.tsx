import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useComprobanteStore } from '@/stores';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTablePagination } from '@/hooks/useTablePagination';
import { TablePagination } from './components/TablePagination';

export const Ventas: React.FC = () => {
  const { comprobantes, comprobanteActual, fetchComprobantes, fetchComprobanteById } = useComprobanteStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('TODOS');
  const formatDate = (value?: string) => value ? new Date(value).toLocaleString('es-PE') : '-';
  const estadoClass = (value: string) =>
    value === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' :
      value === 'ABIERTO' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';

  useEffect(() => { fetchComprobantes(); }, [fetchComprobantes]);

  const filtered = useMemo(() => comprobantes.filter((voucher) => {
    const date = (voucher.fechaHoraVenta || voucher.fechaHoraApertura || '').slice(0, 10);
    const bySearch = `${voucher.id} ${voucher.total} ${date}`.toLowerCase().includes(search.toLowerCase());
    const byStatus = status === 'TODOS' || voucher.estado === status;
    return bySearch && byStatus;
  }), [comprobantes, search, status]);
  const { paginatedData, currentPage, totalPages, totalItems, pageSize, setCurrentPage, setPageSize } = useTablePagination(filtered);

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
              <option value="ELIMINADO">Eliminado</option>
            </select>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Comprobante</th>
                <th className="px-4 py-3 text-left">Fecha Apertura</th>
                <th className="px-4 py-3 text-left">Fecha Venta</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((voucher: any) => (
                <tr key={voucher.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">Comprobante #{voucher.id}</td>
                  <td className="px-4 py-3">{formatDate(voucher.fechaHoraApertura || voucher.fechaHora_apertura || voucher.fechaHoraRegistro || voucher.fechaHora_registro)}</td>
                  <td className="px-4 py-3">{formatDate(voucher.fechaHoraVenta || voucher.fechaHora_venta || voucher.fechaHoraActualizacion || voucher.fechaHora_actualizacion)}</td>
                  <td className="px-4 py-3">S/ {Number(voucher.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${estadoClass(voucher.estado)}`}>{voucher.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => fetchComprobanteById(voucher.id)}>Ver detalle</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
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
              <p><strong>IGV:</strong> S/ {Number(comprobanteActual.igv ?? comprobanteActual.IGV ?? 0).toFixed(2)}</p>
              <p><strong>Subtotal:</strong> S/ {Number((comprobanteActual as any).subtotal ?? 0).toFixed(2)}</p>
              <p><strong>Sucursal:</strong> {(comprobanteActual as any).sucursal?.nombre || '-'}</p>
              <p><strong>Cajero:</strong> {(comprobanteActual as any).cajero?.username || '-'}</p>
              <p className="md:col-span-2"><strong>Fecha de apertura:</strong> {formatDate((comprobanteActual as any).fechaHoraApertura || (comprobanteActual as any).fechaHora_apertura)}</p>
              <p className="md:col-span-2"><strong>Fecha de venta:</strong> {formatDate((comprobanteActual as any).fechaHoraVenta || (comprobanteActual as any).fechaHora_venta)}</p>
              <div className="md:col-span-2">
                <strong>Pedidos:</strong>
                {(comprobanteActual as any).pedidos?.length ? (
                  <ul className="mt-1 list-disc pl-5">
                    {(comprobanteActual as any).pedidos.map((pedido: any) => (
                      <li key={pedido.id}>
                        {pedido.productoNombre || 'Producto'} x{pedido.cantidad} — S/ {Number(pedido.subtotal).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : <span className="ml-2 text-slate-500">Sin pedidos</span>}
              </div>
              <div className="md:col-span-2">
                <strong>Pagos:</strong>
                {(comprobanteActual as any).movimientosTipoPago?.length ? (
                  <ul className="mt-1 list-disc pl-5">
                    {(comprobanteActual as any).movimientosTipoPago.map((mov: any) => (
                      <li key={mov.id}>
                        {mov.tipoPagoNombre || '-'} — S/ {Number(mov.monto).toFixed(2)}
                        {mov.tipoBilleteraVirtualNombre ? ` (${mov.tipoBilleteraVirtualNombre})` : ''}
                      </li>
                    ))}
                  </ul>
                ) : <span className="ml-2 text-slate-500">Sin movimientos de pago</span>}
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default Ventas;