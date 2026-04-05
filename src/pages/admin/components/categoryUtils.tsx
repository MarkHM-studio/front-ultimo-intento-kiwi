export const getProductType = (category?: { id?: number; nombre?: string } | null): 'COMIDA' | 'BEBIDA' | '-' => {
  if (!category) return '-';
  const normalized = (category.nombre || '').trim().toUpperCase();
  const isComida = category.id === 1 || normalized.startsWith('PLATO') || normalized.startsWith('COMIDA');
  if (isComida) return 'COMIDA';

  const isBebida = [2, 3, 4].includes(category.id || 0) || normalized.startsWith('BEBIDA');
  if (isBebida) return 'BEBIDA';

  return '-';
};

export const getProductTypeClass = (type: 'COMIDA' | 'BEBIDA' | '-') => {
  if (type === 'COMIDA') return 'bg-amber-100 text-amber-700';
  if (type === 'BEBIDA') return 'bg-sky-100 text-sky-700';
  return 'bg-slate-100 text-slate-600';
};

const CATEGORY_COLOR_PALETTE = [
  'bg-rose-100 text-rose-700',
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-lime-100 text-lime-700',
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
  'bg-sky-100 text-sky-700',
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-pink-100 text-pink-700',
];

export const getCategoryClass = (categoryId?: number, categoryName?: string) => {
  if (categoryId && categoryId > 0) {
    return CATEGORY_COLOR_PALETTE[(categoryId - 1) % CATEGORY_COLOR_PALETTE.length];
  }

  const text = (categoryName || '').trim();
  const hash = Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CATEGORY_COLOR_PALETTE[hash % CATEGORY_COLOR_PALETTE.length];
};
