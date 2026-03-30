import { EllipsisVertical, Pencil, Power, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface RowActionsProps {
  onEdit: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  inactive?: boolean;
}

export const RowActions = ({ onEdit, onDelete, onActivate, inactive = false }: RowActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <EllipsisVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {inactive ? (
        <DropdownMenuItem onClick={onActivate}>
          <Power className="mr-2 h-4 w-4" />
          Activar
        </DropdownMenuItem>
      ) : (
        <>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {onDelete && (
            <DropdownMenuItem onClick={onDelete} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          )}
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);