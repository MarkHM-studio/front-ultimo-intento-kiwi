import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore, useComprobanteStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MesaRequest } from '@/types';

export const Mesas: React.FC = () => {
  const { mesas, fetchMesas, createMesa, updateMesa, deleteMesa } = useAdminStore();
  const { mesasOcupadas, fetchMesasOcupadas } = useComprobanteStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MesaRequest>({ nombre: '' });

  useEffect(() => {
    fetchMesas();
    fetchMesasOcupadas();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateMesa(editingId, form);
    else await createMesa(form);
    setEditingId(null);
    setForm({ nombre: '' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Mesas</h2>
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar' : 'Nueva'} mesa</CardTitle></CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={submit}>
              <Input value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} placeholder="Nombre mesa" />
              <Button type="submit">{editingId ? 'Actualizar' : 'Crear'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mesas registradas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mesas.map((m) => (
                <div key={m.id} className="flex items-center justify-between border rounded p-3">
                  <span>{m.nombre} - {m.estado}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(m.id); setForm({ nombre: m.nombre }); }}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteMesa(m.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mesas ocupadas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mesasOcupadas.map((m) => (
                <div key={m.mesaId} className="border rounded p-3">
                  Mesa {m.mesaNombre} - Grupo: {m.grupoNombre} - Comprobante: #{m.comprobanteId}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Mesas;