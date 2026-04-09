import { useEffect } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMovimientoInsumoStore } from '@/stores';

export const Salidas: React.FC = () => {
  const { movimientos, movimientoActual, fetchMovimientos, fetchMovimientoDetalle } = useMovimientoInsumoStore();

  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleString('es-PE') : '-');

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-700 p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Salidas de insumos</h2>
          <p className="mt-1 text-sm text-white/80">Listado de movimientos de salida y su detalle por comprobante.</p>
        </section>

        <Card className="overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha registro</th>
                <th className="px-4 py-3 text-left">Insumo</th>
                <th className="px-4 py-3 text-left">Cantidad</th>
                <th className="px-4 py-3 text-left">Comprobante</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mov) => (
                <tr key={mov.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">#{mov.id}</td>
                  <td className="px-4 py-3">{formatDate(mov.fechaHora_registro)}</td>
                  <td className="px-4 py-3">{mov.insumoNombre || '-'}</td>
                  <td className="px-4 py-3">{mov.cantidad} {mov.unidad_medida}</td>
                  <td className="px-4 py-3">{mov.comprobanteId ? `#${mov.comprobanteId}` : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => fetchMovimientoDetalle(mov.id)}>Detalle</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="rounded-2xl p-5">
          <h3 className="mb-3 text-base font-semibold">Detalle de salida</h3>
          {!movimientoActual ? (
            <p className="text-sm text-slate-500">Selecciona una salida para ver el detalle.</p>
          ) : (
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <p><strong>ID:</strong> {movimientoActual.id}</p>
              <p><strong>Cantidad:</strong> {movimientoActual.cantidad} {movimientoActual.unidad_medida}</p>
              <p><strong>Fecha registro:</strong> {formatDate(movimientoActual.fechaHora_registro)}</p>
              <p><strong>Fecha actualización:</strong> {formatDate(movimientoActual.fechaHora_actualizacion)}</p>
              <p><strong>Insumo:</strong> {movimientoActual.insumo?.nombre || '-'}</p>
              <p><strong>Stock actual:</strong> {movimientoActual.insumo?.stock ?? '-'}</p>
              <p><strong>Comprobante:</strong> {movimientoActual.comprobante?.id ? `#${movimientoActual.comprobante.id}` : '-'}</p>
              <p><strong>Estado comprobante:</strong> {movimientoActual.comprobante?.estado || '-'}</p>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default Salidas;