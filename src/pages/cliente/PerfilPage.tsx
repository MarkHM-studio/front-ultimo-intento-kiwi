import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/common/MainLayout';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, ArrowLeft } from 'lucide-react';
import { adminService } from '@/services/adminService';
import type { Cliente } from '@/types';
import { toast } from 'sonner';

export const PerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ telefono: '', correo: '' });

  const initials = useMemo(() => {
    const full = user?.nombreCompleto || user?.correo || 'CL';
    return full.slice(0, 2).toUpperCase();
  }, [user]);

  const loadCliente = async () => {
    if (!user) return;
    try {
      const clientes = await adminService.getClientes();
      const current = clientes.find((item) => item.usuario?.id === user.usuarioId) || null;
      setCliente(current);
      if (current) {
        setFormData({ telefono: current.telefono || '', correo: current.correo || '' });
      }
    } catch {
      toast.error('No se pudo cargar la información del perfil.');
    }
  };

  useEffect(() => {
    loadCliente();
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    if (!cliente) return;
    setIsLoading(true);
    try {
      await adminService.updateCliente(cliente.id, {
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        fechaNacimiento: cliente.fechaNacimiento,
        telefono: formData.telefono,
        correo: formData.correo,
        distritoId: cliente.distrito?.id || 1,
        usuarioId: cliente.usuario.id,
        distrito: cliente.distrito?.nombre || '',
      } as any);
      toast.success('Perfil actualizado correctamente.');
      setIsEditing(false);
      await loadCliente();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/cliente')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Volver
        </Button>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24"><AvatarFallback className="bg-[#8B4513] text-2xl text-white">{initials}</AvatarFallback></Avatar>
                <p className="text-xl font-semibold">{cliente ? `${cliente.nombre} ${cliente.apellido}` : (user.nombreCompleto || 'Cliente')}</p>
                <Badge className="bg-[#8B4513]/10 text-[#8B4513]">{user.rol}</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><User className="h-4 w-4" />Nombre</Label>
                  <Input value={cliente?.nombre || ''} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><User className="h-4 w-4" />Apellido</Label>
                  <Input value={cliente?.apellido || ''} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><Mail className="h-4 w-4" />Correo</Label>
                  {isEditing ? (
                    <Input value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} />
                  ) : (
                    <Input value={cliente?.correo || user.correo} disabled className="bg-gray-50" />
                  )}
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><Calendar className="h-4 w-4" />Fecha de Nacimiento</Label>
                  <Input value={cliente?.fechaNacimiento || '-'} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><Phone className="h-4 w-4" />Teléfono</Label>
                  {isEditing ? (
                    <Input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                  ) : (
                    <Input value={cliente?.telefono || ''} disabled className="bg-gray-50" />
                  )}
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><MapPin className="h-4 w-4" />Distrito</Label>
                  <Input value={cliente?.distrito?.nombre || ''} disabled className="bg-gray-50" />
                </div>
              </div>

              <div className="pt-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    <Button className="flex-1 bg-[#8B4513] hover:bg-[#5D2E0C]" onClick={handleSave} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />Guardar Cambios
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />Editar Perfil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PerfilPage;
