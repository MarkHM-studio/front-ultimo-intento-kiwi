import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MarcaRequest } from '@/types';

export const Marcas: React.FC = () => {
  const { marcas, fetchMarcas, createMarca, updateMarca, deleteMarca, isLoading } = useAdminStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MarcaRequest>({ nombre: '' });

  useEffect(() => {
    fetchMarcas();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    if (editingId) await updateMarca(editingId, form);
    else await createMarca(form);
    setEditingId(null);
    setForm({ nombre: '' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Marcas</h2>
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar' : 'Nueva'} marca</CardTitle></CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={submit}>
              <Input value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} placeholder="Nombre marca" />
              <Button type="submit" disabled={isLoading}>{editingId ? 'Actualizar' : 'Crear'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ nombre: '' }); }}>Cancelar</Button>}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {marcas.map((m) => (
                <div key={m.id} className="flex items-center justify-between border rounded p-3">
                  <span>{m.nombre}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(m.id); setForm({ nombre: m.nombre }); }}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteMarca(m.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Marcas;