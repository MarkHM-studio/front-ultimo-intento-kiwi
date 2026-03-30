import { useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet } from 'lucide-react';

const reportCards = [
  { key: 'ventas', title: 'Ventas' },
  { key: 'usuarios', title: 'Usuarios' },
  { key: 'productos', title: 'Productos' },
  { key: 'insumos', title: 'Insumos' },
];

export const Reportes: React.FC = () => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const exportToExcel = (reportKey: string) => {
    console.log(`Exportando reporte ${reportKey} a Excel`);
  };

  const applyFilter = () => {
    console.log('Filtro aplicado:', { desde, hasta });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-800 p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Reportes</h2>
          <p className="mt-1 text-sm text-white/80">Exportación rápida por módulo con filtro por rango de fechas.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportCards.map((report) => (
            <Card key={report.key} className="rounded-2xl p-5">
              <p className="mb-3 text-base font-semibold text-slate-800">{report.title}</p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => exportToExcel(report.key)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar a Excel
              </Button>
            </Card>
          ))}
        </section>

        <Card className="rounded-2xl p-5">
          <h3 className="mb-3 text-base font-semibold">Filtrar por fecha</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
            <Input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={applyFilter}>Aplicar filtro</Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Reportes;