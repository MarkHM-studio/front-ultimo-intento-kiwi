import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminCrudLayout } from '@/pages/admin/components/AdminCrudLayout';
import { RowActions } from '@/pages/admin/components/RowActions';

export const Marcas: React.FC = () => {
  const { marcas, fetchMarcas, createMarca, updateMarca } = useAdminStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');

  useEffect(() => { fetchMarcas(); }, [fetchMarcas]);

  const filtered = useMemo(() => marcas.filter((brand) =>
    brand.nombre.toLowerCase().includes(search.toLowerCase()),
  ), [marcas, search]);

  const reset = () => { setEditingId(null); setNombre(''); setOpen(false); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nombre.trim()) return;
    if (editingId) await updateMarca(editingId, { nombre });
    else await createMarca({ nombre });
    await fetchMarcas();
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Marcas"
        subtitle="Administra el catálogo de marcas para productos e insumos."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
      >
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Marca</th>
                <th className="px-4 py-3 text-left">Registro</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((brand) => (
                <tr key={brand.id} className="even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{brand.nombre}</td>
                  <td className="px-4 py-3">{brand.fechaHoraRegistro || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onEdit={() => { setEditingId(brand.id); setNombre(brand.nombre); setOpen(true); }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </AdminCrudLayout>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar marca' : 'Nueva marca'}</DialogTitle>
            <DialogDescription>Completa el nombre de la marca.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Marcas;