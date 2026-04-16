import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore, useComprobanteStore, useReservaStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
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
import { comprobanteService } from '@/services/comprobanteService';

const formatMoney = (value: number) => `S/ ${value.toFixed(2)}`;

const getLocalDateKey = (value: Date | string) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
    return value.trim().slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sameDay = (value: string | undefined, target: string) => getLocalDateKey(value || '') === target;

const getReservaDate = (reserva: any) =>
  reserva.fechaReserva ||
  reserva.fechaHoraVerificacionReserva ||
  reserva.fechaVerificacionReserva ||
  reserva.fechaHoraRegistro ||
  reserva.fechaRegistro;

const isReservaVerificada = (reserva: any) => {
  const status = String(reserva.estado || '').toUpperCase();
  return status === 'VERIFICADO' || Boolean(reserva.fechaHoraVerificacionReserva || reserva.fechaVerificacionReserva);
};

export const Dashboard: React.FC = () => {
  const { productos, insumos, fetchProductos, fetchInsumos } = useAdminStore();
  const { comprobantes, fetchComprobantes } = useComprobanteStore();
  const { reservas, fetchReservas } = useReservaStore();

  const [itemsComidaHoy, setItemsComidaHoy] = useState(0);
  const [itemsBebidaHoy, setItemsBebidaHoy] = useState(0);

  useEffect(() => {
    fetchComprobantes();
    fetchProductos();
    fetchInsumos();
    fetchReservas();
  }, [fetchComprobantes, fetchProductos, fetchInsumos, fetchReservas]);

  const todayKey = useMemo(() => getLocalDateKey(new Date()), []);

  const paidComprobantes = useMemo(
    () => comprobantes.filter((c) => String(c.estado).toUpperCase() === 'PAGADO'),
    [comprobantes],
  );

  const paidComprobantesToday = useMemo(
    () => paidComprobantes.filter((c) => sameDay(c.fechaHoraVenta || c.fechaHora_venta || c.fechaHoraApertura, todayKey)),
    [paidComprobantes, todayKey],
  );

  useEffect(() => {
    const loadItemsToday = async () => {
      if (!paidComprobantesToday.length) {
        setItemsComidaHoy(0);
        setItemsBebidaHoy(0);
        return;
      }

      try {
        const detalles = await Promise.all(
          paidComprobantesToday.map((comprobante) => comprobanteService.getPedidosByComprobante(comprobante.id)),
        );

        let comida = 0;
        let bebida = 0;

        detalles.flat().forEach((pedido) => {
          const qty = Number(pedido.cantidad || 0);
          const categoriaId = pedido.producto?.categoria?.id;
          if (categoriaId === 1) comida += qty;
          if ([2, 3, 4].includes(categoriaId || 0)) bebida += qty;
        });

        setItemsComidaHoy(comida);
        setItemsBebidaHoy(bebida);
      } catch {
        setItemsComidaHoy(0);
        setItemsBebidaHoy(0);
      }
    };

    void loadItemsToday();
  }, [paidComprobantesToday]);

  const ventasHoy = paidComprobantesToday.reduce((sum, comprobante) => sum + Number(comprobante.total || 0), 0);

  const reservasConfirmadasHoy = reservas.filter((reserva: any) => {
    const status = String(reserva.estado || '').toUpperCase();
    return (status === 'VERIFICADO' || isReservaVerificada(reserva)) && sameDay(getReservaDate(reserva), todayKey);
  }).length;

  const reservasPagadasHoy = reservas.filter((reserva: any) => {
    const status = String(reserva.estado || '').toUpperCase();
    return status === 'PAGADO' && sameDay(getReservaDate(reserva), todayKey);
  }).length;

  const reservasVerificadasHoy = reservas.filter((reserva: any) => isReservaVerificada(reserva) && sameDay(getReservaDate(reserva), todayKey)).length;

  const pedidosAbiertos = comprobantes.filter((c) => String(c.estado).toUpperCase() === 'ABIERTO').length;
  const stockCriticoInsumos = insumos.filter((insumo) => Number(insumo.stock || 0) <= 5).length;
  const alertStockCriticoProductos = productos.filter((product) => Number(product.stock || 0) <= 10).length;

  const ventasUltimos7Dias = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = getLocalDateKey(date);
      const total = paidComprobantes
        .filter((comprobante) => sameDay(comprobante.fechaHoraVenta || comprobante.fechaHora_venta || comprobante.fechaHoraApertura, key))
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
              <p className="text-sm text-muted-foreground">Ventas hoy</p>
              <p className="mt-1 text-2xl font-bold">{formatMoney(ventasHoy)}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
                <DollarSign className="h-4 w-4" /> Comprobantes pagados de hoy
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Comprobantes abiertos</p>
              <p className="mt-1 text-2xl font-bold">{pedidosAbiertos}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                <ShoppingCart className="h-4 w-4" /> Mesas en consumo
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Reservas confirmadas</p>
              <p className="mt-1 text-2xl font-bold">{reservasConfirmadasHoy}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                <Calendar className="h-4 w-4" /> Verificadas hoy
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Insumos con stock ≤ 5</p>
              <p className="mt-1 text-2xl font-bold">{stockCriticoInsumos}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4" /> Control de reposición
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
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Mix por categorías</CardTitle>
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
                <p className="text-sm text-muted-foreground">Reservas pagadas hoy</p>
                <p className="text-2xl font-bold text-amber-600">{reservasPagadasHoy}</p>
                <Button asChild variant="link" className="h-auto p-0 text-[#8B4513]"><Link to="/admin/reportes">Ver detalle</Link></Button>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Ítems comida</p>
                <p className="text-2xl font-bold text-emerald-700">{itemsComidaHoy}</p>
                <ChefHat className="mt-2 h-4 w-4 text-emerald-700" />
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Ítems bebida</p>
                <p className="text-2xl font-bold text-sky-700">{itemsBebidaHoy}</p>
                <Wine className="mt-2 h-4 w-4 text-sky-700" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">Stock crítico: <strong>{alertStockCriticoProductos}</strong> productos (≤ 10).</div>
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">Reservas verificadas hoy: <strong>{reservasVerificadasHoy}</strong>.</div>
              <Badge className="bg-slate-900">Monitoreo activo</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;