import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CategoriaRequest } from '@/types';

export const Categorias: React.FC = () => {
  const { categorias, fetchCategorias, createCategoria, updateCategoria, deleteCategoria, isLoading } = useAdminStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoriaRequest>({ nombre: '' });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    if (editingId) await updateCategoria(editingId, form);
    else await createCategoria(form);
    setEditingId(null);
    setForm({ nombre: '' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar' : 'Nueva'} categoría</CardTitle></CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={submit}>
              <Input value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} placeholder="Nombre categoría" />
              <Button type="submit" disabled={isLoading}>{editingId ? 'Actualizar' : 'Crear'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ nombre: '' }); }}>Cancelar</Button>}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categorias.map((c) => (
                <div key={c.id} className="flex items-center justify-between border rounded p-3">
                  <span>{c.nombre}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(c.id); setForm({ nombre: c.nombre }); }}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCategoria(c.id)}>Eliminar</Button>
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

export default Categorias;