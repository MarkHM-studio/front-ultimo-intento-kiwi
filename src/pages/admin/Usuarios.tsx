import { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import type { UsuarioRequest } from '@/types';

const ROLES = [
  { id: 1, nombre: 'CLIENTE' },
  { id: 2, nombre: 'MOZO' },
  { id: 3, nombre: 'COCINERO' },
  { id: 4, nombre: 'BARTENDER' },
  { id: 5, nombre: 'CAJERO' },
 { id: 6, nombre: 'RECEPCIONISTA' },
  { id: 7, nombre: 'ALMACENERO' },
  { id: 8, nombre: 'ADMINISTRADOR' },
];

export const Usuarios: React.FC = () => {
  const { usuarios, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario, isLoading } = useAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<number | null>(null);
  const [formData, setFormData] = useState<UsuarioRequest>({
    username: '',
    password: '',
    tipoUsuario: 2,
    estado: 'ACTIVO',
    rolId: 2
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.rol?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        await updateUsuario(editingUsuario, { ...formData, password: undefined });
      } else {
        await createUsuario(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving usuario:', error);
    }
  };

  const handleEdit = (usuario: typeof usuarios[0]) => {
    setEditingUsuario(usuario.id);
    setFormData({
      username: usuario.username,
      password: '',
      tipoUsuario: usuario.tipoUsuario,
      estado: usuario.estado,
      rolId: usuario.rol?.id || 1
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUsuario(id);
      } catch (error) {
        console.error('Error deleting usuario:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingUsuario(null);
    setFormData({
      username: '',
      password: '',
      tipoUsuario: 2,
      estado: 'ACTIVO',
      rolId: 2
    });
  };

  const getEstadoBadge = (estado: string) => {
    if (estado === 'ACTIVO') return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
    return <Badge variant="secondary">Inactivo</Badge>;
  };

  const getRolBadge = (rol: string) => {
    const colors: Record<string, string> = {
      'ADMINISTRADOR': 'bg-purple-100 text-purple-800',
      'MOZO': 'bg-blue-100 text-blue-800',
      'COCINERO': 'bg-orange-100 text-orange-800',
      'BARTENDER': 'bg-pink-100 text-pink-800',
      'CAJERO': 'bg-green-100 text-green-800',
      'RECEPCIONISTA': 'bg-yellow-100 text-yellow-800',
      'ALMACENERO': 'bg-gray-100 text-gray-800',
      'CLIENTE': 'bg-amber-100 text-amber-800',
    };
    return <Badge className={colors[rol] || 'bg-gray-100'}>{rol}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-gray-500">Administra los usuarios del sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                <DialogDescription>
                  Completa los datos del usuario
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Correo Electrónico</Label>
                    <Input
                      id="username"
                      type="email"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="usuario@email.com"
                      required
                    />
                  </div>
                  {!editingUsuario && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        required={!editingUsuario}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select 
                      value={formData.rolId.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, rolId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((rol) => (
                          <SelectItem key={rol.id} value={rol.id.toString()}>
                            {rol.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select 
                      value={formData.estado} 
                      onValueChange={(value: 'ACTIVO' | 'INACTIVO') => setFormData({ ...formData, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVO">Activo</SelectItem>
                        <SelectItem value="INACTIVO">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : (editingUsuario ? 'Actualizar' : 'Guardar')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lista de Usuarios
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
  </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.username}</TableCell>
                      <TableCell>{getRolBadge(usuario.rol?.nombre || 'SIN_ROL')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{usuario.provider}</Badge>
                      </TableCell>
                      <TableCell>{getEstadoBadge(usuario.estado)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(usuario.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Usuarios;
