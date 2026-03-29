import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InsumoRequest } from '@/types';

export const Insumos: React.FC = () => {
  const { insumos, marcas, fetchInsumos, fetchMarcas, createInsumo, updateInsumo, isLoading } = useAdminStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<InsumoRequest>({ nombre: '', precio: 0, stock: 0, unidadMedida: 'KG', marcaId: undefined });

  useEffect(() => {
    fetchInsumos();
    fetchMarcas();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateInsumo(editingId, form, true);
    else await createInsumo(form);
    setEditingId(null);
    setForm({ nombre: '', precio: 0, stock: 0, unidadMedida: 'KG', marcaId: undefined });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Insumos</h2>
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar' : 'Nuevo'} insumo</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid md:grid-cols-5 gap-2">
              <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
              <Input type="number" step="0.01" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              <Input placeholder="Unidad (KG/L/UDS)" value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} />
              <select className="border rounded px-2" value={form.marcaId || ''} onChange={(e) => setForm({ ...form, marcaId: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">Sin marca</option>
                {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
              <div className="md:col-span-5 flex gap-2">
                <Button type="submit" disabled={isLoading}>{editingId ? 'Actualizar' : 'Crear'}</Button>
                {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ nombre: '', precio: 0, stock: 0, unidadMedida: 'KG' }); }}>Cancelar</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insumos.map((i) => (
                <div key={i.id} className="flex items-center justify-between border rounded p-3">
                  <span>{i.nombre} - {i.unidadMedida} - S/ {i.precio} - Stock {i.stock}</span>
                  <Button variant="outline" size="sm" onClick={() => { setEditingId(i.id); setForm({ nombre: i.nombre, precio: i.precio, stock: i.stock, unidadMedida: i.unidadMedida, marcaId: i.marca?.id }); }}>Editar</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Insumos;