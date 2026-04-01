import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <span>Mostrando {from} - {to} de {totalItems}</span>
        <select
          className="h-9 rounded-md border border-slate-200 px-2 text-sm"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option} por página</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </Button>
        <span className="text-xs md:text-sm">Página {currentPage} de {totalPages}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};