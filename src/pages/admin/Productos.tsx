import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProductoRequest } from '@/types';

const initialForm: ProductoRequest = {
  nombre: '',
  precio: 0,
  stock: 0,
  categoriaId: 0,
  marcaId: undefined,
};

export const Productos: React.FC = () => {
  const {
    productos,
    categorias,
    marcas,
    fetchProductos,
    fetchCategorias,
    fetchMarcas,
    createProducto,
    updateProducto,
    deleteProducto,
    isLoading,
  } = useAdminStore();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductoRequest>(initialForm);

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchMarcas();
  }, []);

  const filtered = useMemo(
    () =>
      productos.filter((p) => {
        const nombre = p.nombre?.toLowerCase() || '';
        const categoria = p.categoria?.nombre?.toLowerCase() || '';
        const q = search.toLowerCase();
        return nombre.includes(q) || categoria.includes(q);
      }),
    [productos, search]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.categoriaId) return;

    if (editingId) await updateProducto(editingId, form);
    else await createProducto(form);

    setEditingId(null);
    setForm(initialForm);
  };

  const edit = (id: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      nombre: p.nombre || '',
      precio: p.precio || 0,
      stock: p.stock || 0,
      categoriaId: p.categoria?.id || 0,
      marcaId: p.marca?.id,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Nuevo'} producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid md:grid-cols-5 gap-2">
              <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
              <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />

              <select className="border rounded px-2" value={form.categoriaId || 0} onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}>
                <option value={0}>Categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              <select className="border rounded px-2" value={form.marcaId || 0} onChange={(e) => setForm({ ...form, marcaId: Number(e.target.value) || undefined })}>
                <option value={0}>Sin marca</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>

              <div className="md:col-span-5 flex gap-2">
                <Button type="submit" disabled={isLoading}>{editingId ? 'Actualizar' : 'Crear'}</Button>
                {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancelar</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado de productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="Buscar por nombre o categoría" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3" />
            <div className="space-y-2">
              {filtered.map((p) => (
                <div key={p.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.nombre || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-500">Categoría: {p.categoria?.nombre || 'N/A'} | Marca: {p.marca?.nombre || 'N/A'} | S/ {p.precio ?? 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => edit(p.id)}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteProducto(p.id)}>Eliminar</Button>
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

export default Productos;