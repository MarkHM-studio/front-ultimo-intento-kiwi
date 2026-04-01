import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { useAdminStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminCrudLayout } from './components/AdminCrudLayout';
import { RowActions } from './components/RowActions';
import type { UsuarioRequest } from '@/types';
import { Eye, EyeOff } from 'lucide-react';
import { useTablePagination } from '@/hooks/useTablePagination';
import { TablePagination } from './components/TablePagination';

const ROLES = [
  { id: 1, nombre: 'CLIENTE' }, { id: 2, nombre: 'MOZO' }, { id: 3, nombre: 'COCINERO' }, { id: 4, nombre: 'BARTENDER' },
  { id: 5, nombre: 'CAJERO' }, { id: 6, nombre: 'RECEPCIONISTA' }, { id: 7, nombre: 'ALMACENERO' }, { id: 8, nombre: 'ADMINISTRADOR' },
];
const initialForm: UsuarioRequest = { username: '', password: '', tipoUsuario: 2, estado: 'ACTIVO', rolId: 2 };
const normalizeStatus = (value?: string) => (value || '').trim().toUpperCase();

export const Usuarios: React.FC = () => {
  const { usuarios, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario, activateUsuario } = useAdminStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UsuarioRequest>(initialForm);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { fetchUsuarios(statusFilter); }, [fetchUsuarios, statusFilter]);

  const filtered = useMemo(() => usuarios.filter((user: any) => {
    const roleName = user.rol?.nombre || user.rolNombre || '';
    const bySearch = `${user.username} ${roleName}`.toLowerCase().includes(search.toLowerCase());
    const byRole = roleFilter === 0 || (user.rol?.id || user.rolId) === roleFilter;
    const byStatus = normalizeStatus(user.estado || 'ACTIVO') === statusFilter;
    return bySearch && byRole && byStatus;
  }), [usuarios, search, roleFilter, statusFilter]);
    const { paginatedData, currentPage, totalPages, totalItems, pageSize, setCurrentPage, setPageSize } = useTablePagination(filtered);

  const reset = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(false);
    setShowPassword(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.password) {
      window.alert('La contraseña es obligatoria para crear y actualizar usuarios.');
      return;
    }
    if (editingId) await updateUsuario(editingId, form);
    else await createUsuario(form);
    await fetchUsuarios(statusFilter);
    reset();
  };

  return (
    <MainLayout>
      <AdminCrudLayout
        title="Usuarios"
        subtitle="Gestión completa de usuarios del sistema (crear, editar y eliminar)."
        search={search}
        onSearch={setSearch}
        onCreate={() => setOpen(true)}
        filters={(
          <div className="flex gap-2">
            <select
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
              value={roleFilter}
              onChange={(event) => setRoleFilter(Number(event.target.value))}
            >
              <option value={0}>Todos los roles</option>
              {ROLES.map((role) => <option key={role.id} value={role.id}>{role.nombre}</option>)}
            </select>
            <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'ACTIVO' | 'INACTIVO')}>
              <option value="ACTIVO">ACTIVOS</option>
              <option value="INACTIVO">INACTIVOS</option>
            </select>
          </div>
        )}
      >
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
           <tbody>
              {paginatedData.map((user: any) => (
                <tr key={user.id} className="bg-white text-slate-700 even:bg-slate-50/30">
                  <td className="px-4 py-3 font-medium">{user.username}</td>
                  <td className="px-4 py-3">{user.rol?.nombre || user.rolNombre || '-'}</td>
                  <td className="px-4 py-3">{user.estado}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      onEdit={() => {
                        setEditingId(user.id);
                        setForm({
                          username: user.username,
                          password: (user as any).password || '',
                          tipoUsuario: user.tipoUsuario || 2,
                          estado: user.estado || 'ACTIVO',
                          rolId: user.rol?.id || user.rolId || 2,
                        });
                        setOpen(true);
                      }}
                      onDelete={normalizeStatus(user.estado) === 'INACTIVO' ? undefined : async () => {
                        await deleteUsuario(user.id);
                        await fetchUsuarios(statusFilter);
                      }}
                      inactive={normalizeStatus(user.estado) === 'INACTIVO'}
                      onActivate={async () => {
                        await activateUsuario(user.id);
                        await fetchUsuarios(statusFilter);
                      }}
                    />
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
        </section>
      </AdminCrudLayout>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            <DialogDescription>Completa la información para guardar el registro.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder={editingId ? 'Contraseña del usuario' : 'Password'} value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <select className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" value={form.rolId} onChange={(e) => setForm({ ...form, rolId: Number(e.target.value) })}>
              {ROLES.map((role) => <option key={role.id} value={role.id}>{role.nombre}</option>)}
            </select>
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

export default Usuarios;