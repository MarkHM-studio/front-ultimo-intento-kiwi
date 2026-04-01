import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { MainLayout } from '@/components/common/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, FilterX, Funnel } from 'lucide-react';
import { useAdminStore, useComprobanteStore } from '@/stores';
import { toast } from 'sonner';

type ReportKey = 'ventas' | 'usuarios' | 'productos' | 'insumos';

const reportCards: Array<{ key: ReportKey; title: string }> = [
  { key: 'ventas', title: 'Ventas' },
  { key: 'usuarios', title: 'Usuarios' },
  { key: 'productos', title: 'Productos' },
  { key: 'insumos', title: 'Insumos' },
];

export const Reportes: React.FC = () => {
  const { usuarios, productos, insumos, fetchUsuarios, fetchProductos, fetchInsumos } = useAdminStore();
  const { comprobantes, fetchComprobantes } = useComprobanteStore();

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState<{ desde: string; hasta: string } | null>(null);

  useEffect(() => {
    fetchUsuarios();
    fetchProductos();
    fetchInsumos();
    fetchComprobantes();
  }, [fetchUsuarios, fetchProductos, fetchInsumos, fetchComprobantes]);

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
        total: row.total,
        igv: row.igv,
        estado: row.estado,
        fechaHoraVenta: row.fechaHoraVenta || row.fechaHora_venta || '-',
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
        precio: row.precio,
        stock: row.stock,
        fechaModificacion: row.fechaModificacion || '-',
      }))
  ), [productos, filtroAplicado]);

  const insumosRows = useMemo(() => (
    insumos
      .filter((row: any) => isBetween(row.fechaHoraActualizacion || row.fechaHoraRegistro))
      .map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        unidadMedida: row.unidadMedida,
        precio: row.precio,
        stock: row.stock,
        fechaActualizacion: row.fechaHoraActualizacion || row.fechaHoraRegistro || '-',
      }))
  ), [insumos, filtroAplicado]);

  const datasets: Record<ReportKey, any[]> = {
    ventas: ventasRows,
    usuarios: usuariosRows,
    productos: productosRows,
    insumos: insumosRows,
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
    if (!desde || !hasta) {
      toast.error('Debes seleccionar fecha de inicio y fecha de fin.');
      return;
    }
    if (hasta < desde) {
      toast.error('La fecha fin no puede ser menor que la fecha inicio.');
      return;
    }

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
          <h2 className="text-2xl font-bold">Reportes</h2>
          <p className="mt-1 text-sm text-white/80">Exportación a Excel por módulo con filtro opcional de fechas.</p>
          {filtroAplicado && (
            <Badge className="mt-3 bg-amber-600 text-white">
              Filtro activo: {filtroAplicado.desde} a {filtroAplicado.hasta}
            </Badge>
          )}
        </section>

        <Card className="rounded-2xl p-5">
          <h3 className="mb-3 text-base font-semibold">Filtrar por fecha</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <Input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
            <Input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={applyFilter}>
              <Funnel className="mr-2 h-4 w-4" />
              Aplicar filtro
            </Button>
            {filtroAplicado && (
              <Button variant="outline" onClick={clearFilter}>
                <FilterX className="mr-2 h-4 w-4" />
                Eliminar filtro
              </Button>
            )}
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportCards.map((report) => {
            const reportData = datasets[report.key];
            const withFilterText = filtroAplicado ? ' (Filtrado por fechas)' : '';
            return (
              <Card key={report.key} className="rounded-2xl border-slate-200 p-5">
                <p className="mb-1 text-base font-semibold text-slate-800">{report.title}</p>
                <p className="mb-3 text-xs text-slate-500">Registros: {reportData.length}</p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => exportToExcel(report.key)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar a Excel{withFilterText}
                </Button>
              </Card>
            );
          })}
        </section>
      </div>
    </MainLayout>
  );
};

export default Reportes;