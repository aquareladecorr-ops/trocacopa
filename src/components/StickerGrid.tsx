'use client';
import { useState, useMemo } from 'react';
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

export function StickerGrid({ figurinhas, mode, marked, onToggle, onIncrement, onDecrement, onSave, saving, saved }: StickerGridProps) {
  const [filter, setFilter] = useState('');
  const [showOnly, setShowOnly] = useState<'all' | 'marked' | 'unmarked'>('all');

  const filtered = useMemo(() => {
    return figurinhas.filter((f) => {
      if (filter && !f.codigo.toUpperCase().includes(filter.toUpperCase()) && !(f.nome || '').toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
      const isMarked = marked[f.id]?.qtd > 0;
      if (showOnly === 'marked' && !isMarked) return false;
      if (showOnly === 'unmarked' && isMarked) return false;
      return true;
    });
  }, [figurinhas, filter, showOnly, marked]);

  const totalMarked = Object.values(marked).filter((m) => m.qtd > 0).length;

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
        {filtered.map((f) => {
          const m = marked[f.id];
          const isActive = (m?.qtd ?? 0) > 0;
          return (
            <div key={f.id} className="relative group">
              <button
                onClick={() => onToggle(f.id, m?.qtd ?? 0)}
                className={cn(
                  'sticker-cell relative aspect-square w-full rounded-lg border-2 bg-white text-xs font-bold flex items-center justify-center transition-colors',
                  raridadeColors[f.raridade],
                  isActive && (mode === 'tenho' ? 'active-have' : 'active-need')
                )}
                title={f.codigo + (f.nome ? ' - ' + f.nome : '')}
              >
                {f.codigo}
                {mode === 'tenho' && isActive && m.qtd > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-ink-900 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                    {m.qtd}
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
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhuma figurinha encontrada com esse filtro.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="text-xs text-gray-500 flex gap-4 flex-wrap">
          <span><span className="inline-block w-3 h-3 bg-gray-300 rounded mr-1 align-middle"></span>Comum</span>
          <span><span className="inline-block w-3 h-3 border-2 border-yellow-400 rounded mr-1 align-middle"></span>Rara</span>
          <span><span className="inline-block w-3 h-3 border-2 border-blue-500 rounded mr-1 align-middle"></span>Especial</span>
          <span><span className="inline-block w-3 h-3 border-2 border-purple-500 rounded mr-1 align-middle"></span>Legend</span>
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
