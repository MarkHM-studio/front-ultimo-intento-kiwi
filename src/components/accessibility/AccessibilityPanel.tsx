import { Accessibility, Contrast, Moon, Sun, Type, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  TEXT_SCALE_STEPS,
  useAccessibilityStore,
  type AccessibilityTheme,
} from '@/stores/accessibilityStore';

const themeOptions: Array<{ value: AccessibilityTheme; label: string; icon: typeof Sun }> = [
  { value: 'default', label: 'Predeterminado', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'high-contrast', label: 'Alto contraste', icon: Contrast },
  { value: 'colorblind', label: 'Daltonismo', icon: Accessibility },
];

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const { theme, textScale, reduceMotion, setTheme, setTextScale, setReduceMotion, announce, reset } =
    useAccessibilityStore();

  const textScaleLabel = useMemo(() => `${Math.round(textScale * 100)}%`, [textScale]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full shadow-lg"
          aria-label="Abrir panel de accesibilidad"
        >
          <Accessibility className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl" aria-describedby="accessibility-panel-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Opciones de accesibilidad
          </DialogTitle>
          <DialogDescription id="accessibility-panel-description">
            Personaliza contraste, tamaño de texto y movimiento. Se guarda automáticamente para futuras visitas.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-4" aria-label="Modos de color">
          <h3 className="text-sm font-semibold">Modo de color</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = option.value === theme;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  className={cn('justify-start gap-2', isActive && 'ring-2 ring-ring ring-offset-2')}
                  onClick={() => {
                    setTheme(option.value);
                    announce(`Tema cambiado a ${option.label}`);
                  }}
                  aria-pressed={isActive}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3" aria-label="Escalado de tipografía">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="text-scale" className="inline-flex items-center gap-2">
              <Type className="h-4 w-4" />
              Tamaño de texto global
            </Label>
            <span className="text-sm text-muted-foreground">{textScaleLabel}</span>
          </div>
          <Slider
            id="text-scale"
            min={0}
            max={TEXT_SCALE_STEPS.length - 1}
            step={1}
            value={[TEXT_SCALE_STEPS.indexOf(textScale)]}
            onValueChange={([index]) => {
              const nextValue = TEXT_SCALE_STEPS[index] ?? 1;
              setTextScale(nextValue);
              announce(`Tamaño de texto actualizado a ${Math.round(nextValue * 100)} por ciento`);
            }}
            aria-label="Tamaño de texto global"
          />
          <p className="text-xs text-muted-foreground">Afecta tablas, formularios, diálogos y todas las vistas.</p>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-md border p-3" aria-label="Animaciones">
          <div>
            <p className="font-medium">Reducir animaciones</p>
            <p className="text-xs text-muted-foreground">Disminuye transiciones para una navegación más cómoda.</p>
          </div>
          <Switch
            checked={reduceMotion}
            onCheckedChange={(value) => {
              setReduceMotion(value);
              announce(value ? 'Animaciones reducidas activadas' : 'Animaciones reducidas desactivadas');
            }}
            aria-label="Reducir animaciones"
          />
        </section>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              announce('Preferencias de accesibilidad restablecidas');
            }}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Restablecer valores
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}