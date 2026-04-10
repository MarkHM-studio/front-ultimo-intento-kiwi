import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore, useComprobanteStore, useReservaStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ChefHat,
  Wine,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const formatMoney = (value: number) => `S/ ${value.toFixed(2)}`;

export const Dashboard: React.FC = () => {
  const { dashboardStats, fetchDashboardStats, productos, fetchProductos } = useAdminStore();
  const { comprobantes, fetchComprobantes } = useComprobanteStore();
  const { reservas, fetchReservas } = useReservaStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchComprobantes();
    fetchProductos();
    fetchReservas();
  }, [fetchDashboardStats, fetchComprobantes, fetchProductos, fetchReservas]);

  const paidComprobantes = useMemo(() => comprobantes.filter((c) => c.estado === 'PAGADO'), [comprobantes]);

  const ventasUltimos7Dias = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const total = paidComprobantes
        .filter((comprobante) => (comprobante.fechaHoraVenta || '').slice(0, 10) === key)
        .reduce((sum, comprobante) => sum + Number(comprobante.total || 0), 0);
      return {
        dia: date.toLocaleDateString('es-PE', { weekday: 'short' }),
        fecha: key,
        ventas: total,
      };
    });

    return days;
  }, [paidComprobantes]);

  const topCategorias = useMemo(() => {
    const grouped = productos.reduce<Record<string, number>>((acc, product) => {
      const key = product.categoria?.nombre || 'Sin categoría';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [productos]);

  const reservasPendientes = reservas.filter((r) => r.estado === 'ESPERANDO PAGO').length;
  const reservasConfirmadas = reservas.filter((r) => r.estado === 'PAGADO').length;
  const pedidosAbiertos = comprobantes.filter((c) => c.estado === 'ABIERTO').length;
  const stockCritico = productos.filter((p) => p.stock <= 3).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#8B4513] p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Dashboard Ejecutivo</h2>
          <p className="mt-1 text-sm text-white/80">
            Resumen operativo en tiempo real y accesos rápidos a reportes detallados.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
              <Link to="/admin/reportes">Ir a Reportes <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Ventas hoy</p>
              <p className="mt-1 text-2xl font-bold">{formatMoney(Number(dashboardStats?.ventasHoy || 0))}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
                <DollarSign className="h-4 w-4" /> Ingreso diario
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Comprobantes abiertos</p>
              <p className="mt-1 text-2xl font-bold">{pedidosAbiertos}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                <ShoppingCart className="h-4 w-4" /> Mesas en consumo
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Reservas confirmadas</p>
              <p className="mt-1 text-2xl font-bold">{reservasConfirmadas}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                <Calendar className="h-4 w-4" /> Reservas pagadas
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Stock crítico</p>
              <p className="mt-1 text-2xl font-bold">{stockCritico}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4" /> Productos con stock ≤ 3
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Ventas últimos 7 días</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={ventasUltimos7Dias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} labelFormatter={(label, payload) => `${label} (${payload?.[0]?.payload?.fecha || ''})`} />
                  <Line type="monotone" dataKey="ventas" stroke="#b45309" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Mix por categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCategorias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Mini-reportes operativos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border p-4">
                <p className="text-sm text-slate-500">Reservas pendientes</p>
                <p className="text-2xl font-bold text-amber-600">{reservasPendientes}</p>
                <Button asChild variant="link" className="h-auto p-0 text-[#8B4513]"><Link to="/admin/reportes">Ver detalle</Link></Button>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-sm text-slate-500">Ítems comida</p>
                <p className="text-2xl font-bold text-emerald-700">{productos.filter((p) => p.categoria?.id === 1).length}</p>
                <ChefHat className="mt-2 h-4 w-4 text-emerald-700" />
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-sm text-slate-500">Ítems bebida</p>
                <p className="text-2xl font-bold text-sky-700">{productos.filter((p) => [2, 3, 4].includes(p.categoria?.id || 0)).length}</p>
                <Wine className="mt-2 h-4 w-4 text-sky-700" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">Stock crítico: <strong>{stockCritico}</strong> productos.</div>
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">Reservas esperando pago: <strong>{reservasPendientes}</strong>.</div>
              <Badge className="bg-slate-900">Monitoreo activo</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;