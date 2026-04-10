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
import api from '@/services/api';
import type { Cliente, Distrito } from '@/types';
import { toast } from 'sonner';

type PerfilFormData = {
  nombre: string;
  apellido: string;
  correo: string;
  fechaNacimiento: string;
  telefono: string;
  distrito: string;
};

const emptyForm: PerfilFormData = {
  nombre: '',
  apellido: '',
  correo: '',
  fechaNacimiento: '',
  telefono: '',
  distrito: '',
};

const getApiErrorMessage = (error: any): string => {
  const message = error?.response?.data?.message || error?.friendlyMessage;
  if (typeof message === 'string' && message.trim()) return message;
  return 'No pudimos completar la solicitud. Inténtalo nuevamente.';
};

export const PerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [formData, setFormData] = useState<PerfilFormData>(emptyForm);

  const provider = user?.provider || user?.proveedor;
  const isGoogleUser = provider === 'GOOGLE';

  const initials = useMemo(() => {
    const full = user?.nombreCompleto || user?.correo || 'CL';
    return full.slice(0, 2).toUpperCase();
  }, [user]);

  const isFieldEditable = (field: keyof PerfilFormData) => {
    if (!isEditing) return false;
    if (isGoogleUser) return true;
    return field === 'telefono' || field === 'distrito';
  };

  const loadPerfil = async () => {
    if (!user?.clienteId) return;

    setIsLoading(true);
    try {
      const [clienteResponse, distritoResponse] = await Promise.all([
        api.get<Cliente>(`/cliente/${user.clienteId}`),
        api.get<Distrito[]>('/distrito'),
      ]);

      const clienteData = clienteResponse.data;
      setCliente(clienteData);
      setDistritos(distritoResponse.data);

      setFormData({
        nombre: clienteData.nombre || '',
        apellido: clienteData.apellido || '',
        correo: clienteData.correo || user.correo || '',
        fechaNacimiento: clienteData.fechaNacimiento || '',
        telefono: clienteData.telefono || '',
        distrito: clienteData.distrito?.nombre || '',
      });
    } catch (error: any) {
      toast.error(`No se pudo cargar tu perfil. ${getApiErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerfil();
  }, [user?.clienteId]);

  if (!user) return null;

  const handleCancel = () => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        correo: cliente.correo || user.correo || '',
        fechaNacimiento: cliente.fechaNacimiento || '',
        telefono: cliente.telefono || '',
        distrito: cliente.distrito?.nombre || '',
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!cliente) return;

    setIsSaving(true);
    try {
      const distritoName = formData.distrito.trim();
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        fechaNacimiento: formData.fechaNacimiento || null,
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim().toLowerCase(),
        usuarioId: cliente.usuario?.id,
        distrito: distritoName,
      };

      await api.put(`/cliente/${cliente.id}`, payload);
      toast.success('Perfil actualizado correctamente.');
      setIsEditing(false);
      await loadPerfil();
    } catch (error: any) {
      toast.error(`No se pudo actualizar tu perfil. ${getApiErrorMessage(error)}`);
    } finally {
      setIsSaving(false);
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
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-[#8B4513] text-2xl text-white">{initials}</AvatarFallback>
                </Avatar>
                <p className="text-xl font-semibold">{cliente ? `${cliente.nombre} ${cliente.apellido}` : (user.nombreCompleto || 'Cliente')}</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#8B4513]/10 text-[#8B4513]">{user.rol}</Badge>
                  <Badge variant="outline">{isGoogleUser ? 'Google' : 'Local'}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><User className="h-4 w-4" />Nombre</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    disabled={!isFieldEditable('nombre')}
                    className={!isFieldEditable('nombre') ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><User className="h-4 w-4" />Apellido</Label>
                  <Input
                    value={formData.apellido}
                    onChange={(e) => setFormData((prev) => ({ ...prev, apellido: e.target.value }))}
                    disabled={!isFieldEditable('apellido')}
                    className={!isFieldEditable('apellido') ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><Mail className="h-4 w-4" />Correo</Label>
                  <Input
                    value={formData.correo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, correo: e.target.value }))}
                    disabled={!isFieldEditable('correo')}
                    className={!isFieldEditable('correo') ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><Calendar className="h-4 w-4" />Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={formData.fechaNacimiento || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fechaNacimiento: e.target.value }))}
                    disabled={!isFieldEditable('fechaNacimiento')}
                    className={!isFieldEditable('fechaNacimiento') ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><Phone className="h-4 w-4" />Teléfono</Label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                    disabled={!isFieldEditable('telefono')}
                    className={!isFieldEditable('telefono') ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label className="mb-1 flex items-center gap-2 text-gray-500"><MapPin className="h-4 w-4" />Distrito</Label>
                  {isFieldEditable('distrito') ? (
                    <Input
                      list="distritos-perfil"
                      value={formData.distrito}
                      onChange={(e) => setFormData((prev) => ({ ...prev, distrito: e.target.value }))}
                    />
                  ) : (
                    <Input value={formData.distrito} disabled className="bg-gray-50" />
                  )}
                  <datalist id="distritos-perfil">
                    {distritos.map((distrito) => (
                      <option key={distrito.id} value={distrito.nombre} />
                    ))}
                  </datalist>
                </div>
              </div>

              {isGoogleUser ? (
                <p className="text-sm text-slate-500">Puedes completar o actualizar todos tus datos del perfil porque tu cuenta se creó con Google.</p>
              ) : (
                <p className="text-sm text-slate-500">Para cuentas locales solo se permite editar teléfono y distrito.</p>
              )}

              <div className="pt-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleCancel}>Cancelar</Button>
                    <Button className="flex-1 bg-[#8B4513] hover:bg-[#5D2E0C]" onClick={handleSave} disabled={isSaving || isLoading}>
                      <Save className="mr-2 h-4 w-4" />Guardar Cambios
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)} disabled={isLoading || !cliente}>
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