'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MatchCard } from '@/components/MatchCard';
import { ProposalModal } from '@/components/ProposalModal';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { MatchRow, Colecao } from '@/lib/types';

export default function MatchesPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const colecaoSlug = sp.get('colecao') || 'mundial-2026';

  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [colecaoAtual, setColecaoAtual] = useState<Colecao | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesmaCidadeOnly, setMesmaCidadeOnly] = useState(false);
  const [modalMatch, setModalMatch] = useState<MatchRow | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cols } = await supabase.from('colecoes').select('*').eq('ativa', true);
      setColecoes(cols ?? []);
      const cur = cols?.find((c) => c.slug === colecaoSlug) ?? cols?.[0];
      setColecaoAtual(cur ?? null);
      if (!cur) { setLoading(false); return; }

      const { data, error } = await supabase.rpc('buscar_matches', {
        p_user_id: user.id,
        p_colecao_id: cur.id,
        p_limite: 50,
        p_mesma_cidade_only: mesmaCidadeOnly,
      });

      if (error) console.error('Erro buscar_matches:', error);
      setMatches(data ?? []);
      setLoading(false);
    })();
  }, [colecaoSlug, mesmaCidadeOnly]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="display text-2xl">Trocas encontradas</h1>
          <p className="text-sm text-gray-600">Colecionadores que têm o que você precisa — e precisam do que você tem.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mesmaCidadeOnly ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMesmaCidadeOnly((v) => !v)}
          >
            📍 Só minha cidade
          </Button>
          <Select
            value={colecaoSlug}
            onChange={(e) => router.push(`/painel/matches?colecao=${e.target.value}`)}
            className="max-w-xs"
          >
            {colecoes.map((c) => <option key={c.id} value={c.slug}>{c.nome}</option>)}
          </Select>
        </div>
      </div>

      {loading ? (
        <Card><div className="text-center py-12 text-gray-500">Procurando trocas…</div></Card>
      ) : matches.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="display text-3xl mb-2">😔</div>
            <h3 className="display text-xl mb-2">Nenhuma troca encontrada ainda</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Adicione suas repetidas e faltantes para começar — quanto mais cromos cadastrados,
              maior a chance de encontrar trocas perfeitas.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push(`/painel/tenho?colecao=${colecaoSlug}`)} variant="secondary">
                Cadastrar repetidas
              </Button>
              <Button onClick={() => router.push(`/painel/preciso?colecao=${colecaoSlug}`)}>
                Cadastrar faltantes
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-3">
            <span className="font-semibold text-ink-900">{matches.length}</span> {matches.length === 1 ? 'colecionador encontrado' : 'colecionadores encontrados'}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <MatchCard key={m.user_b_id} match={m} onPropose={setModalMatch} />
            ))}
          </div>
        </>
      )}

      <ProposalModal
        match={modalMatch}
        colecaoId={colecaoAtual?.id ?? ''}
        onClose={() => setModalMatch(null)}
        onSent={() => {
          setMatches((prev) => prev.filter((m) => m.user_b_id !== modalMatch?.user_b_id));
        }}
      />
    </div>
  );
}
