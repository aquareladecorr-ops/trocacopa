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
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [marked, setMarked] = useState<Record<string, { qtd: number; isHave: boolean }>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: cols } = await supabase.from('colecoes').select('*').eq('ativa', true);
      setColecoes(cols ?? []);
      const cur = cols?.find((c) => c.slug === colecaoSlug) ?? cols?.[0];
      if (!cur) { setLoading(false); return; }
      const { data: figs } = await supabase.from('figurinhas').select('*').eq('colecao_id', cur.id).order('numero');
      setFigurinhas(figs ?? []);
      const { data: falts } = await supabase.from('faltantes').select('figurinha_id').eq('user_id', user.id);
      const initial: Record<string, { qtd: number; isHave: boolean }> = {};
      falts?.forEach((f: any) => { initial[f.figurinha_id] = { qtd: 1, isHave: false }; });
      setMarked(initial);
      setLoading(false);
      setHasChanges(false);
    })();
  }, [colecaoSlug]);

  function onToggle(figurinhaId: string, currentQtd: number) {
    const next = currentQtd > 0 ? 0 : 1;
    setMarked((prev) => ({ ...prev, [figurinhaId]: { qtd: next, isHave: false } }));
    setHasChanges(true);
    setSaved(false);
  }

  const handleSave = useCallback(async () => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const toDelete = Object.entries(marked).filter(([, v]) => v.qtd <= 0).map(([id]) => id);
      const toInsert = Object.entries(marked).filter(([, v]) => v.qtd > 0).map(([id]) => ({ user_id: userId, figurinha_id: id }));
      if (toDelete.length > 0) await supabase.from('faltantes').delete().eq('user_id', userId).in('figurinha_id', toDelete);
      if (toInsert.length > 0) await supabase.from('faltantes').upsert(toInsert, { onConflict: 'user_id,figurinha_id' });
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }, [userId, marked, saving]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="display text-2xl">Minhas faltantes</h1>
          <p className="text-sm text-gray-600">
            Toque nas figurinhas que faltam. O sistema vai cruzar com as repetidas de outros usuarios.
            {hasChanges && <span className="ml-2 text-amber-600 font-semibold">Alteracoes nao salvas</span>}
          </p>
        </div>
        <Select value={colecaoSlug} onChange={(e) => router.push('/painel/preciso?colecao=' + e.target.value)} className="max-w-xs">
          {colecoes.map((c) => <option key={c.id} value={c.slug}>{c.nome}</option>)}
        </Select>
      </div>
      <Card>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : (
          <StickerGrid figurinhas={figurinhas} mode="preciso" marked={marked} onToggle={onToggle} onSave={handleSave} saving={saving} saved={saved} />
        )}
      </Card>
    </div>
  );
        }
