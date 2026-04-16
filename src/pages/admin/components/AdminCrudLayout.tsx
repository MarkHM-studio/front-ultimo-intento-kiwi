import type { ReactNode } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminCrudLayoutProps {
  title: string;
  subtitle: string;
  search: string;
  onSearch: (value: string) => void;
  filters?: ReactNode;
  onCreate: () => void;
  children: ReactNode;
}

export const AdminCrudLayout = ({ title, subtitle, search, onSearch, filters, onCreate, children }: AdminCrudLayoutProps) => {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-800 p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-white/80">{subtitle}</p>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Buscar registro..."
                className="pl-9"
              />
            </div>
            {filters}
          </div>
          <Button className="bg-amber-600 hover:bg-amber-700" onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            NUEVO
          </Button>
        </div>
      </section>

      {children}
    </div>
  );
};