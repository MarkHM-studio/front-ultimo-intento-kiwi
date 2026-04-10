import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { MainLayout } from '@/components/common/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, FilterX, Funnel, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStore, useComprobanteStore, useReservaStore } from '@/stores';
import { toast } from 'sonner';

type ReportKey = 'ventas' | 'usuarios' | 'productos' | 'insumos' | 'reservas';

const reportCards: Array<{ key: ReportKey; title: string; subtitle: string }> = [
  { key: 'ventas', title: 'Ventas', subtitle: 'Comprobantes pagados y tickets.' },
  { key: 'usuarios', title: 'Usuarios', subtitle: 'Cuentas y actividad de registro.' },
  { key: 'productos', title: 'Productos', subtitle: 'Catálogo, stock y precios.' },
  { key: 'insumos', title: 'Insumos', subtitle: 'Inventario y costos de insumos.' },
  { key: 'reservas', title: 'Reservas', subtitle: 'Estado de reservas de clientes.' },
];

export const Reportes: React.FC = () => {
  const { usuarios, productos, insumos, fetchUsuarios, fetchProductos, fetchInsumos } = useAdminStore();
  const { comprobantes, fetchComprobantes } = useComprobanteStore();
  const { reservas, fetchReservas } = useReservaStore();

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState<{ desde: string; hasta: string } | null>(null);
  const [activeReport, setActiveReport] = useState<ReportKey>('ventas');

  useEffect(() => {
    fetchUsuarios();
    fetchProductos();
    fetchInsumos();
    fetchComprobantes();
    fetchReservas();
  }, [fetchUsuarios, fetchProductos, fetchInsumos, fetchComprobantes, fetchReservas]);

  const normalizeDate = (value?: string) => (value || '').slice(0, 10);
  const isBetween = (value?: string) => {
    if (!filtroAplicado) return true;
    const current = normalizeDate(value);
    if (!current) return false;
    return current >= filtroAplicado.desde && current <= filtroAplicado.hasta;
  };

  const ventasRows = useMemo(() => (
    comprobantes
      .filter((row: any) => isBetween(row.fechaHoraVenta || row.fechaHora_venta || row.fechaHoraApertura))
      .map((row: any) => ({
        id: row.id,
        total: Number(row.total || 0),
        igv: Number(row.igv || row.IGV || 0),
        estado: row.estado,
        fechaHoraVenta: row.fechaHoraVenta || row.fechaHora_venta || row.fechaHoraApertura || '-',
      }))
  ), [comprobantes, filtroAplicado]);

  const usuariosRows = useMemo(() => (
    usuarios
      .filter((row: any) => isBetween(row.fechaHoraRegistro || row.fechaHora_registro))
      .map((row: any) => ({
        id: row.id,
        username: row.username,
        rol: row.rol?.nombre || '-',
        estado: row.estado,
        fechaRegistro: row.fechaHoraRegistro || row.fechaHora_registro || '-',
      }))
  ), [usuarios, filtroAplicado]);

  const productosRows = useMemo(() => (
    productos
      .filter((row: any) => isBetween(row.fechaModificacion || row.fechaInscripcion))
      .map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        categoria: row.categoria?.nombre || '-',
        marca: row.marca?.nombre || '-',
        precio: Number(row.precio || 0),
        stock: Number(row.stock || 0),
        fechaModificacion: row.fechaModificacion || row.fechaInscripcion || '-',
      }))
  ), [productos, filtroAplicado]);

  const insumosRows = useMemo(() => (
    insumos
      .filter((row: any) => isBetween(row.fechaHoraActualizacion || row.fechaHoraRegistro))
      .map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        unidadMedida: row.unidadMedida,
        precio: Number(row.precio || 0),
        stock: Number(row.stock || 0),
        fechaActualizacion: row.fechaHoraActualizacion || row.fechaHoraRegistro || '-',
      }))
  ), [insumos, filtroAplicado]);

  const reservasRows = useMemo(() => (
    reservas
      .filter((row: any) => isBetween(row.fechaReserva || row.fechaRegistro))
      .map((row: any) => ({
        id: row.id,
        fechaReserva: row.fechaReserva,
        horaReserva: row.horaReserva,
        estado: row.estado,
        numPersonas: row.numPersonas,
        usuarioId: row.usuarioId,
      }))
  ), [reservas, filtroAplicado]);

  const datasets: Record<ReportKey, any[]> = {
    ventas: ventasRows,
    usuarios: usuariosRows,
    productos: productosRows,
    insumos: insumosRows,
    reservas: reservasRows,
  };

  const exportToExcel = (reportKey: ReportKey) => {
    const data = datasets[reportKey];
    if (!data.length) {
      toast.error('No hay datos para exportar en este reporte.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportKey.toUpperCase());

    const suffix = filtroAplicado ? `_filtrado_${filtroAplicado.desde}_${filtroAplicado.hasta}` : '_completo';
    XLSX.writeFile(workbook, `reporte_${reportKey}${suffix}.xlsx`);
    toast.success(`Reporte de ${reportKey} exportado correctamente.`);
  };

  const applyFilter = () => {
    if (!desde || !hasta) return toast.error('Debes seleccionar fecha de inicio y fecha de fin.');
    if (hasta < desde) return toast.error('La fecha fin no puede ser menor que la fecha inicio.');
    setFiltroAplicado({ desde, hasta });
    toast.success('Filtro aplicado correctamente.');
  };

  const clearFilter = () => {
    setFiltroAplicado(null);
    setDesde('');
    setHasta('');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#8B4513] p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold">Módulo de Reportes</h2>
              <p className="mt-1 text-sm text-white/80">Análisis detallado con filtros avanzados y exportación Excel.</p>
            </div>
            <Button asChild variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
              <Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Volver al Dashboard</Link>
            </Button>
          </div>
          {filtroAplicado && <Badge className="mt-3 bg-amber-600 text-white">Filtro activo: {filtroAplicado.desde} a {filtroAplicado.hasta}</Badge>}
        </section>

        <Card className="rounded-2xl p-5">
          <h3 className="mb-3 text-base font-semibold">Filtro global por fecha</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <Input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
            <Input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={applyFilter}><Funnel className="mr-2 h-4 w-4" />Aplicar filtro</Button>
            {filtroAplicado && <Button variant="outline" onClick={clearFilter}><FilterX className="mr-2 h-4 w-4" />Eliminar filtro</Button>}
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {reportCards.map((report) => {
            const reportData = datasets[report.key];
            return (
              <Card key={report.key} className={`rounded-2xl border p-5 ${activeReport === report.key ? 'border-[#8B4513] ring-2 ring-[#8B4513]/20' : 'border-slate-200'}`}>
                <p className="mb-1 text-base font-semibold text-slate-800">{report.title}</p>
                <p className="text-xs text-slate-500">{report.subtitle}</p>
                <p className="mt-2 text-xs text-slate-500">Registros: {reportData.length}</p>
                <div className="mt-3 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => setActiveReport(report.key)}>Ver detalle</Button>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => exportToExcel(report.key)}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />Exportar
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>

        <Card className="rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Detalle: {reportCards.find((r) => r.key === activeReport)?.title}</h3>
            <Button variant="outline" onClick={() => exportToExcel(activeReport)}><Download className="mr-2 h-4 w-4" />Exportar reporte activo</Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {Object.keys(datasets[activeReport][0] || { mensaje: 'Sin datos' }).map((column) => <th key={column} className="px-3 py-2 text-left">{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {datasets[activeReport].slice(0, 50).map((row, index) => (
                  <tr key={index} className="border-b">
                    {Object.values(row).map((value, cIndex) => <td key={cIndex} className="px-3 py-2">{String(value)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Reportes;