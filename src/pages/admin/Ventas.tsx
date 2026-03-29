import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useComprobanteStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Ventas: React.FC = () => {
  const { comprobantes, comprobanteActual, fetchComprobantes, fetchComprobanteById } = useComprobanteStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchComprobantes();
  }, []);

  const verDetalle = async (id: number) => {
    setSelectedId(id);
    await fetchComprobanteById(id);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Visualización de Comprobantes</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Comprobantes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comprobantes.map((c) => (
                  <div key={c.id} className={`border rounded p-3 flex items-center justify-between ${selectedId === c.id ? 'bg-amber-50 border-amber-300' : ''}`}>
                    <div>
                      <p>#{c.id} - {c.estado}</p>
                      <p className="text-sm text-gray-500">Total S/ {c.total.toFixed(2)}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => verDetalle(c.id)}>Detalle</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Detalle del comprobante</CardTitle></CardHeader>
            <CardContent>
              {!comprobanteActual ? (
                <p className="text-gray-500">Selecciona un comprobante</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p>ID: {comprobanteActual.id}</p>
                  <p>Estado: {comprobanteActual.estado}</p>
                  <p>Subtotal: S/ {comprobanteActual.subtotal.toFixed(2)}</p>
                  <p>IGV: S/ {comprobanteActual.igv.toFixed(2)}</p>
                  <p>Total: S/ {comprobanteActual.total.toFixed(2)}</p>
                  <p>Sucursal: {comprobanteActual.sucursal.nombre}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Ventas;