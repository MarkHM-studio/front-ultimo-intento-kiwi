import { useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Chrome,
  Eye,
  EyeOff,
  GlassWater,
  Loader2,
  AlertCircle,
  KeyRound,
  Mail,
  ShieldCheck,
  LogIn,
  UserPlus,
} from 'lucide-react';

import api from '@/services/api';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Distrito } from '@/types';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,25}$/;
type AuthView = 'login' | 'register' | 'forgot' | 'verify' | 'reset';

type RecoveryState = { correo: string; token: string; expiresAt?: string };

const loginSchema = z.object({
  correo: z.string().email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const registerSchema = z
  .object({
    nombre: z.string().min(2, 'Ingresa tu nombre'),
    apellido: z.string().min(2, 'Ingresa tu apellido'),
    fechaNacimiento: z.string().min(1, 'Selecciona tu fecha de nacimiento'),
    correo: z.string().email('Ingresa un correo válido'),
    telefono: z.string().regex(/^\d{9}$/, 'El teléfono debe tener 9 dígitos'),
    distrito: z.string().min(2, 'Selecciona o ingresa un distrito'),
    password: z.string().regex(passwordRegex, 'Usa mayúscula, minúscula, número y símbolo (8-25).'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

const forgotSchema = z.object({ correo: z.string().email('Ingresa un correo válido') });
const verifySchema = z.object({
  correo: z.string().email('Ingresa un correo válido'),
  token: z.string().min(6, 'Ingresa el código de 6 dígitos'),
});
const resetSchema = z
  .object({
    password: z.string().regex(passwordRegex, 'Usa mayúscula, minúscula, número y símbolo (8-25).'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const autoVerifyRef = useRef(false);

  const { login, register, forgotPassword, verifyResetToken, resetPassword, isLoading, error: storeError, clearError, logout } = useAuthStore();

  const [view, setView] = useState<AuthView>('login');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [districts, setDistricts] = useState<Distrito[]>([]);
  const [recoveryState, setRecoveryState] = useState<RecoveryState | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const loginForm = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });
  const forgotForm = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  const verifyForm = useForm<z.infer<typeof verifySchema>>({ resolver: zodResolver(verifySchema) });
  const resetForm = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    api.get<Distrito[]>('/distrito').then((r) => setDistricts(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.pathname === '/register') {
      setView('register');
      setActiveTab('register');
    } else if (location.pathname === '/forgot-password') setView('forgot');
    else if (location.pathname === '/reset-password') setView('verify');
    else {
      setView('login');
      setActiveTab('login');
    }
  }, [location.pathname]);

  useEffect(() => {
    const oauthError = searchParams.get('oauth_error') || searchParams.get('error_description') || searchParams.get('error');
    if (!oauthError) return;
    const normalized = oauthError.toLowerCase();
    if (
      normalized.includes('inactivo') ||
      normalized.includes('disabled') ||
      normalized.includes('unauthorized') ||
      normalized.includes('no autorizado') ||
      normalized.includes('forbidden')
    ) {
      setGlobalError('Tu cuenta está inactiva. Contacta al administrador.');
    } else if (normalized.includes('google')) {
      setGlobalError('Esta cuenta fue creada con Google. Inicia sesión con Google.');
    } else {
      setGlobalError(oauthError);
    }
    setView('login');
    setActiveTab('login');
  }, [searchParams]);

  useEffect(() => {
    const email = searchParams.get('email') || searchParams.get('correo');
    const token = searchParams.get('token');
    if (!email || !token || autoVerifyRef.current) return;

    autoVerifyRef.current = true;
    setView('verify');
    verifyForm.setValue('correo', email);
    verifyForm.setValue('token', token);

    verifyResetToken({ correo: email, token })
      .then((resp) => {
        setRecoveryState({ correo: resp.correo, token, expiresAt: resp.expiresAt });
        setView('reset');
        setGlobalError('');
      })
      .catch((err: any) => setGlobalError(getErrorMessage(err, 'No se pudo validar el enlace de recuperación')));
  }, [searchParams, verifyForm, verifyResetToken]);

  const districtOptions = useMemo(() => districts.map((d) => d.nombre), [districts]);

  const setError = (msg: string) => setGlobalError(msg);
  const onAnyChange = () => {
    clearError();
    setGlobalError('');
  };

  const goLogin = () => {
    onAnyChange();
    setRecoveryState(null);
    setSearchParams({});
    autoVerifyRef.current = false;
    navigate('/login', { replace: true });
  };

  const onLogin = loginForm.handleSubmit(async (values) => {
    onAnyChange();
    try {
      await login(values);
      navigate('/redirect');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Correo o contraseña incorrectos'));
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    onAnyChange();
    try {
      const { confirmPassword, ...payload } = values;
      void confirmPassword;
      await register(payload);
      // Flujo solicitado: luego de registro exitoso volver a login
      logout();
      setActiveTab('login');
      setView('login');
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudo completar el registro'));
    }
  });

  const onForgot = forgotForm.handleSubmit(async ({ correo }) => {
    onAnyChange();
    try {
      await forgotPassword({ correo });
      verifyForm.reset({ correo, token: '' });
      navigate('/reset-password', { replace: true });
      setView('verify');
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudo iniciar la recuperación'));
    }
  });

  const onVerify = verifyForm.handleSubmit(async (values) => {
    onAnyChange();
    try {
      const resp = await verifyResetToken(values);
      setRecoveryState({ correo: resp.correo, token: values.token, expiresAt: resp.expiresAt });
      setSearchParams({ email: resp.correo, token: values.token });
      setView('reset');
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudo validar el código'));
    }
  });

  const onReset = resetForm.handleSubmit(async (values) => {
    onAnyChange();
    if (!recoveryState) {
      setView('verify');
      return setError('Primero valida el código de recuperación.');
    }

    try {
      await resetPassword({
        correo: recoveryState.correo,
        token: recoveryState.token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      goLogin();
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudo actualizar la contraseña'));
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F3] to-[#D4A574]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity" type="button">
            <div className="bg-[#8B4513] p-3 rounded-xl">
              <GlassWater className="w-8 h-8 text-white" />
            </div>
          </button>
          <h1 className="text-2xl font-bold text-[#1F2937]">La Pituca</h1>
          <p className="text-[#6B7280]">Sistema de Gestión</p>
        </div>

        <Card className="rounded-2xl shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {(view === 'login' || view === 'register') && (
              <Tabs value={activeTab} onValueChange={(v) => { onAnyChange(); setActiveTab(v as 'login' | 'register'); setView(v as AuthView); navigate(v === 'login' ? '/login' : '/register'); }}>
                <TabsList className="grid w-full grid-cols-2 rounded-none bg-[#FDF8F3]">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-[#8B4513] rounded-none py-4">
                    <LogIn className="w-4 h-4 mr-2" />Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-[#8B4513] rounded-none py-4">
                    <UserPlus className="w-4 h-4 mr-2" />Registrarse
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="p-6 m-0">
                  <AuthError message={globalError || storeError || ''} />
                  <form onSubmit={onLogin} className="space-y-4">
                    <Field label="Correo electrónico"><Input type="email" placeholder="cliente@correo.com" {...loginForm.register('correo', { onChange: onAnyChange })} className="h-11" /><Err msg={loginForm.formState.errors.correo?.message} /></Field>
                    <Field label="Contraseña">
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="TuContraseña@123" className="h-11 pr-10" {...loginForm.register('password', { onChange: onAnyChange })} />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                      </div>
                      <Err msg={loginForm.formState.errors.password?.message} />
                    </Field>
                    <Button type="submit" className="w-full h-11 bg-[#8B4513] hover:bg-[#5D2E0C]" disabled={isLoading}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}</Button>
                    <Button type="button" variant="outline" onClick={() => window.location.assign(authService.getGoogleOAuthUrl())} disabled={isLoading} className="w-full h-11 border-gray-300 hover:bg-gray-50"><Chrome className="w-5 h-5 mr-2 text-red-500" />Google</Button>
                    <button type="button" className="w-full text-center text-sm text-[#6B7280] hover:text-[#8B4513]" onClick={() => navigate('/forgot-password')}>¿Olvidaste tu contraseña?</button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="p-6 m-0">
                  <AuthError message={globalError || storeError || ''} />
                  <form onSubmit={onRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Nombre"><Input placeholder="Juan" className="h-11" {...registerForm.register('nombre', { onChange: onAnyChange })} /><Err msg={registerForm.formState.errors.nombre?.message} /></Field>
                      <Field label="Apellido"><Input placeholder="Pérez" className="h-11" {...registerForm.register('apellido', { onChange: onAnyChange })} /><Err msg={registerForm.formState.errors.apellido?.message} /></Field>
                    </div>
                    <Field label="Fecha de nacimiento"><Input className="h-11" type="date" placeholder="2000-05-20" {...registerForm.register('fechaNacimiento', { onChange: onAnyChange })} /><Err msg={registerForm.formState.errors.fechaNacimiento?.message} /></Field>
                    <Field label="Correo electrónico"><Input className="h-11" type="email" placeholder="juan.perez@gmail.com" {...registerForm.register('correo', { onChange: onAnyChange })} /><Err msg={registerForm.formState.errors.correo?.message} /></Field>
                    <Field label="Teléfono"><Input className="h-11" placeholder="987654321" {...registerForm.register('telefono', { onChange: onAnyChange })} /><Err msg={registerForm.formState.errors.telefono?.message} /></Field>
                    <Field label="Distrito">
                      <Input className="h-11" list="district-options" placeholder="Selecciona tu distrito" {...registerForm.register('distrito', { onChange: onAnyChange })} />
                      <datalist id="district-options">{districtOptions.map((d) => <option key={d} value={d} />)}</datalist>
                      <Err msg={registerForm.formState.errors.distrito?.message} />
                    </Field>
                    <Field label="Contraseña">
                      <div className="relative">
                        <Input className="h-11 pr-10" placeholder="Segura@123" type={showRegisterPassword ? 'text' : 'password'} {...registerForm.register('password', { onChange: onAnyChange })} />
                        <button type="button" onClick={() => setShowRegisterPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showRegisterPassword ? 'Ocultar contraseña de registro' : 'Mostrar contraseña de registro'}>{showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                      </div>
                      <Err msg={registerForm.formState.errors.password?.message} />
                    </Field>
                    <Field label="Confirmar contraseña"><Input className="h-11" placeholder="Segura@123" type={showRegisterPassword ? 'text' : 'password'} {...registerForm.register('confirmPassword', { onChange: onAnyChange })} /><Err msg={registerForm.formState.errors.confirmPassword?.message} /></Field>
                    <Button type="submit" className="w-full h-11 bg-[#8B4513] hover:bg-[#5D2E0C]" disabled={isLoading}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Cuenta'}</Button>
                    <Button type="button" variant="outline" onClick={() => window.location.assign(authService.getGoogleOAuthUrl())} disabled={isLoading} className="w-full h-11 border-gray-300 hover:bg-gray-50"><Chrome className="w-5 h-5 mr-2 text-red-500" />Continuar con Google</Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {view === 'forgot' && (
              <div className="p-6 space-y-4">
                <AuthError message={globalError || storeError || ''} />
                <h3 className="font-semibold">Recuperar contraseña</h3>
                <form onSubmit={onForgot} className="space-y-4">
                  <Field label="Correo"><Input type="email" placeholder="cliente@correo.com" {...forgotForm.register('correo', { onChange: onAnyChange })} /><Err msg={forgotForm.formState.errors.correo?.message} /></Field>
                  <Button className="w-full h-11 bg-[#8B4513] hover:bg-[#5D2E0C]" type="submit" disabled={isLoading}><Mail className="w-4 h-4 mr-2" />Enviar recuperación</Button>
                  <Button className="w-full h-11" type="button" variant="outline" onClick={goLogin}>Volver a iniciar sesión</Button>
                </form>
              </div>
            )}

            {view === 'verify' && (
              <div className="p-6 space-y-4">
                <AuthError message={globalError || storeError || ''} />
                <h3 className="font-semibold">Verificar código</h3>
                <form onSubmit={onVerify} className="space-y-4">
                  <Field label="Correo"><Input type="email" placeholder="cliente@correo.com" {...verifyForm.register('correo', { onChange: onAnyChange })} /><Err msg={verifyForm.formState.errors.correo?.message} /></Field>
                  <Field label="Código"><Input placeholder="123456" {...verifyForm.register('token', { onChange: onAnyChange })} /><Err msg={verifyForm.formState.errors.token?.message} /></Field>
                  <Button className="w-full h-11 bg-[#8B4513] hover:bg-[#5D2E0C]" type="submit" disabled={isLoading}><ShieldCheck className="w-4 h-4 mr-2" />Verificar</Button>
                </form>
              </div>
            )}

            {view === 'reset' && (
              <div className="p-6 space-y-4">
                <AuthError message={globalError || storeError || ''} />
                <h3 className="font-semibold">Nueva contraseña</h3>
                <p className="text-xs text-muted-foreground">Cuenta: {recoveryState?.correo}</p>
                <form onSubmit={onReset} className="space-y-4">
                  <Field label="Contraseña nueva">
                    <div className="relative">
                      <Input type={showResetPassword ? 'text' : 'password'} placeholder="NuevaSegura@123" className="pr-10" {...resetForm.register('password', { onChange: onAnyChange })} />
                      <button type="button" onClick={() => setShowResetPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showResetPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}>{showResetPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                    </div>
                    <Err msg={resetForm.formState.errors.password?.message} />
                  </Field>
                  <Field label="Confirmar contraseña"><Input type={showResetPassword ? 'text' : 'password'} placeholder="NuevaSegura@123" {...resetForm.register('confirmPassword', { onChange: onAnyChange })} /><Err msg={resetForm.formState.errors.confirmPassword?.message} /></Field>
                  <Button className="w-full h-11 bg-[#8B4513] hover:bg-[#5D2E0C]" type="submit" disabled={isLoading}><KeyRound className="w-4 h-4 mr-2" />Actualizar contraseña</Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        <button onClick={() => navigate('/')} className="mt-6 flex items-center justify-center gap-2 text-[#6B7280] hover:text-[#8B4513] transition-colors mx-auto" type="button">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </button>
      </div>
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="space-y-2 block">
      <span className="mb-2 block">{label}</span>
      {children}
    </Label>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500">{msg}</p>;
}

function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="mb-4" role="alert" aria-live="assertive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function getErrorMessage(error: any, fallback: string) {
  const rawPayload = error?.response?.data;
  if (typeof rawPayload === 'string' && rawPayload.trim()) return rawPayload;
  const backendMessage = rawPayload?.message || error?.friendlyMessage || error?.message;
  if (typeof backendMessage === 'string' && backendMessage.trim()) return backendMessage;
  if (error?.response?.status === 401) return 'Correo o contraseña incorrectos';
  if (error?.response?.status === 403) return 'Tu cuenta está inactiva. Contacta al administrador.';
  return fallback;
}

export default AuthPage;
