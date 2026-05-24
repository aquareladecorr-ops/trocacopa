'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StickerGrid } from '@/components/StickerGrid';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import type { Figurinha, Colecao } from '@/lib/types';

export default function PrecisoPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const colecaoSlug = sp.get('colecao') || 'mundial-2026';

  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [colecao, setColecao] = useState<Colecao | null>(null);
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [marked, setMarked] = useState<Record<string, { qtd: number; isHave: boolean }>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: cols } = await supabase.from('colecoes').select('*').eq('ativa', true);
      setColecoes(cols ?? []);
      const cur = cols?.find((c) => c.slug === colecaoSlug) ?? cols?.[0];
      setColecao(cur ?? null);
      if (!cur) return;

      const { data: figs } = await supabase
        .from('figurinhas')
        .select('*')
        .eq('colecao_id', cur.id)
        .order('numero');
      setFigurinhas(figs ?? []);

      const { data: falts } = await supabase
        .from('faltantes')
        .select('figurinha_id')
        .eq('user_id', user.id);

      const initial: Record<string, { qtd: number; isHave: boolean }> = {};
      falts?.forEach((f: any) => { initial[f.figurinha_id] = { qtd: 1, isHave: false }; });
      setMarked(initial);
      setLoading(false);
    })();
  }, [colecaoSlug]);

  const persist = useCallback(async (figurinhaId: string, mark: boolean) => {
    if (!userId) return;
    const supabase = createClient();
    if (mark) {
      await supabase.from('faltantes').upsert({ user_id: userId, figurinha_id: figurinhaId });
    } else {
      await supabase.from('faltantes').delete().eq('user_id', userId).eq('figurinha_id', figurinhaId);
    }
  }, [userId]);

  function onToggle(figurinhaId: string, currentQtd: number) {
    const next = currentQtd > 0 ? 0 : 1;
    setMarked((prev) => ({ ...prev, [figurinhaId]: { qtd: next, isHave: false } }));
    persist(figurinhaId, next > 0);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="display text-2xl">Minhas faltantes</h1>
          <p className="text-sm text-gray-600">Toque nas figurinhas que faltam. O sistema vai cruzar com as repetidas de outros usuários.</p>
        </div>
        <Select
          value={colecaoSlug}
          onChange={(e) => router.push(`/painel/preciso?colecao=${e.target.value}`)}
          className="max-w-xs"
        >
          {colecoes.map((c) => <option key={c.id} value={c.slug}>{c.nome}</option>)}
        </Select>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando…</div>
        ) : (
          <StickerGrid figurinhas={figurinhas} mode="preciso" marked={marked} onToggle={onToggle} />
        )}
      </Card>
    </div>
  );
}
