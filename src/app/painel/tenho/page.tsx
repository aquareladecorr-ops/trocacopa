'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StickerGrid } from '@/components/StickerGrid';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import type { Figurinha, Colecao } from '@/lib/types';

export default function TenhoPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const colecaoSlug = sp.get('colecao') || 'mundial-2026';

  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [colecao, setColecao] = useState<Colecao | null>(null);
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [marked, setMarked] = useState<Record<string, { qtd: number; isHave: boolean }>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega coleções, coleção atual e figurinhas
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

      // Carrega repetidas do usuário
      const { data: reps } = await supabase
        .from('repetidas')
        .select('figurinha_id,quantidade')
        .eq('user_id', user.id);

      const initial: Record<string, { qtd: number; isHave: boolean }> = {};
      reps?.forEach((r: any) => {
        initial[r.figurinha_id] = { qtd: r.quantidade, isHave: true };
      });
      setMarked(initial);
      setLoading(false);
    })();
  }, [colecaoSlug]);

  const persist = useCallback(async (figurinhaId: string, qtd: number) => {
    if (!userId) return;
    const supabase = createClient();
    if (qtd <= 0) {
      await supabase.from('repetidas').delete().eq('user_id', userId).eq('figurinha_id', figurinhaId);
    } else {
      await supabase.from('repetidas').upsert({ user_id: userId, figurinha_id: figurinhaId, quantidade: qtd });
    }
  }, [userId]);

  function onToggle(figurinhaId: string, currentQtd: number) {
    const next = currentQtd > 0 ? 0 : 1;
    setMarked((prev) => ({ ...prev, [figurinhaId]: { qtd: next, isHave: true } }));
    persist(figurinhaId, next);
  }
  function onIncrement(figurinhaId: string) {
    setMarked((prev) => {
      const cur = prev[figurinhaId]?.qtd ?? 0;
      const next = cur + 1;
      persist(figurinhaId, next);
      return { ...prev, [figurinhaId]: { qtd: next, isHave: true } };
    });
  }
  function onDecrement(figurinhaId: string) {
    setMarked((prev) => {
      const cur = prev[figurinhaId]?.qtd ?? 0;
      const next = Math.max(0, cur - 1);
      persist(figurinhaId, next);
      return { ...prev, [figurinhaId]: { qtd: next, isHave: true } };
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="display text-2xl">Minhas repetidas</h1>
          <p className="text-sm text-gray-600">Toque nos números das figurinhas que você tem em duplicata. Use + e − para ajustar a quantidade.</p>
        </div>
        <Select
          value={colecaoSlug}
          onChange={(e) => router.push(`/painel/tenho?colecao=${e.target.value}`)}
          className="max-w-xs"
        >
          {colecoes.map((c) => <option key={c.id} value={c.slug}>{c.nome}</option>)}
        </Select>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando…</div>
        ) : (
          <StickerGrid
            figurinhas={figurinhas}
            mode="tenho"
            marked={marked}
            onToggle={onToggle}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        )}
      </Card>
    </div>
  );
}
