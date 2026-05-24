'use client';
import { useState, useMemo, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './ui/Input';
import type { Figurinha } from '@/lib/types';

interface Marked { qtd: number; isHave: boolean; }

interface StickerGridProps {
  figurinhas: Figurinha[];
  mode: 'tenho' | 'preciso';
  marked: Record<string, Marked>;
  onToggle: (figurinhaId: string, currentQtd: number) => void;
  onIncrement?: (figurinhaId: string) => void;
  onDecrement?: (figurinhaId: string) => void;
  onSave?: () => Promise<void>;
  saving?: boolean;
  saved?: boolean;
}

const raridadeColors: Record<string, string> = {
  comum: 'border-gray-200',
  rara: 'border-yellow-400',
  legend: 'border-purple-500',
  especial: 'border-blue-500',
};

interface StickerItemProps {
  f: Figurinha;
  mode: 'tenho' | 'preciso';
  marked: Marked | undefined;
  onToggle: (id: string, qtd: number) => void;
  onIncrement?: (id: string) => void;
  onDecrement?: (id: string) => void;
}

const StickerItem = memo(function StickerItem({ f, mode, marked, onToggle, onIncrement, onDecrement }: StickerItemProps) {
  const qtd = marked?.qtd ?? 0;
  const isActive = qtd > 0;
  return (
    <div className="relative group">
      <button
        onClick={() => onToggle(f.id, qtd)}
        className={cn(
          'sticker-cell relative aspect-square w-full rounded-lg border-2 bg-white text-xs font-bold flex items-center justify-center transition-colors',
          raridadeColors[f.raridade],
          isActive && (mode === 'tenho' ? 'active-have' : 'active-need')
        )}
        title={f.codigo + (f.nome ? ' - ' + f.nome : '')}
      >
        {f.codigo}
        {mode === 'tenho' && isActive && qtd > 1 && (
          <span className="absolute -top-1.5 -right-1.5 bg-ink-900 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
            {qtd}
          </span>
        )}
      </button>
      {mode === 'tenho' && isActive && onIncrement && onDecrement && (
        <div className="absolute inset-x-0 -bottom-3 flex justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onDecrement(f.id); }}
            className="bg-white border border-ink-100 rounded text-xs px-1 shadow-sm hover:bg-ink-100"
          >-</button>
          <button
            onClick={(e) => { e.stopPropagation(); onIncrement(f.id); }}
            className="bg-white border border-ink-100 rounded text-xs px-1 shadow-sm hover:bg-ink-100"
          >+</button>
        </div>
      )}
    </div>
  );
});

export function StickerGrid({ figurinhas, mode, marked, onToggle, onIncrement, onDecrement, onSave, saving, saved }: StickerGridProps) {
  const [filter, setFilter] = useState('');
  const [showOnly, setShowOnly] = useState<'all' | 'marked' | 'unmarked'>('all');

  const filteredByText = useMemo(() => {
    return figurinhas.filter((f) => {
      if (filter && !f.codigo.toUpperCase().includes(filter.toUpperCase()) && !(f.nome || '').toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [figurinhas, filter]);

  const filtered = useMemo(() => {
    if (showOnly === 'all') return filteredByText;
    return filteredByText.filter((f) => {
      const isMarked = (marked[f.id]?.qtd ?? 0) > 0;
      if (showOnly === 'marked' && !isMarked) return false;
      if (showOnly === 'unmarked' && isMarked) return false;
      return true;
    });
  }, [filteredByText, showOnly, marked]);

  const totalMarked = useMemo(() => Object.values(marked).filter((m) => m.qtd > 0).length, [marked]);

  const handleToggle = useCallback((id: string, qtd: number) => onToggle(id, qtd), [onToggle]);
  const handleIncrement = useCallback((id: string) => onIncrement?.(id), [onIncrement]);
  const handleDecrement = useCallback((id: string) => onDecrement?.(id), [onDecrement]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Buscar por numero (ex: 254)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2 text-xs">
          {(['all', 'marked', 'unmarked'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setShowOnly(k)}
              className={cn(
                'px-3 py-1.5 rounded-lg border-2 font-medium transition',
                showOnly === k
                  ? 'bg-ink-900 text-white border-ink-900'
                  : 'bg-white border-ink-100 hover:border-ink-900'
              )}
            >
              {k === 'all' ? 'Todas' : k === 'marked' ? 'Marcadas' : 'Nao marcadas'}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-gray-600">
          <span className="font-semibold text-ink-900">{totalMarked}</span> marcadas
          <span className="text-gray-400"> / {figurinhas.length}</span>
        </span>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
        {filtered.map((f) => (
          <StickerItem
            key={f.id}
            f={f}
            mode={mode}
            marked={marked[f.id]}
            onToggle={handleToggle}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-4 text-xs text-gray-500">
          <span><span className="inline-block w-2 h-2 bg-gray-200 rounded mr-1 align-middle"></span>Comum</span>
          <span><span className="inline-block w-2 h-2 bg-yellow-400 rounded mr-1 align-middle"></span>Rara</span>
          <span><span className="inline-block w-2 h-2 bg-blue-500 rounded mr-1 align-middle"></span>Especial</span>
          <span><span className="inline-block w-2 h-2 bg-purple-500 rounded mr-1 align-middle"></span>Legend</span>
        </div>

        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className={cn(
              'px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md',
              saved
                ? 'bg-green-500 text-white cursor-default'
                : saving
                ? 'bg-gray-300 text-gray-500 cursor-wait'
                : 'bg-ink-900 text-white hover:bg-ink-700 active:scale-95'
            )}
          >
            {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar cadastro'}
          </button>
        )}
      </div>
    </div>
  );
                                                                      }
