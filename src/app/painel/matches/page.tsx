'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MatchCard } from '@/components/MatchCard';
import { ProposalModal } from '@/components/ProposalModal';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { MatchRow, Colecao } from '@/lib/types';

const MapaMatches = lazy(() => import('@/components/MapaMatches'));

export default function MatchesPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const colecaoSlug = sp.get('colecao') || 'mundial-2026';

  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [colecaoAtual, setColecaoAtual] = useState<Colecao | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesmaCidadeOnly, setMesmaCidadeOnly] = useState(false);
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [modalMatch, setModalMatch] = useState<MatchRow | null>(null);
  const [mostrarMapa, setMostrarMapa] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchColecoes() {
      const { data } = await supabase
        .from('colecoes')
        .select('*')
        .eq('ativa', true)
        .order('criado_em', { ascending: false });
      if (data) {
        setColecoes(data);
        const atual = data.find((c) => c.slug === colecaoSlug) ?? data[0] ?? null;
        setColecaoAtual(atual);
      }
    }
    fetchColecoes();
  }, [colecaoSlug]);

  useEffect(() => {
    if (!colecaoAtual) return;
    async function fetchMatches() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      let query = supabase.rpc('encontrar_matches', {
        p_user_id: user.id,
        p_colecao_id: colecaoAtual!.id,
      });

      if (mesmaCidadeOnly) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('cidade')
          .eq('id', user.id)
          .single();
        if (perfil?.cidade) {
          query = (query as any).eq('user_b_cidade', perfil.cidade);
        }
      }

      const { data } = await query;
      setMatches(data ?? []);
      setLoading(false);
    }
    fetchMatches();
  }, [colecaoAtual, mesmaCidadeOnly]);

  // Cidades únicas dos matches para o filtro
  const cidadesUnicas = Array.from(
    new Set(matches.map((m) => m.user_b_cidade).filter(Boolean))
  ).sort() as string[];

  // Matches filtrados por cidade (se selecionado)
  const matchesFiltrados = cidadeFiltro
    ? matches.filter((m) => m.user_b_cidade === cidadeFiltro)
    : matches;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Trocas encontradas</h1>
          <p className="text-sm text-gray-500">Colecionadores que têm o que você precisa — e precisam do que você tem.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={mesmaCidadeOnly ? 'primary' : 'ghost'}
            onClick={() => setMesmaCidadeOnly((v) => !v)}
          >
            📍 Só minha cidade
          </Button>
          <Select
            value={colecaoSlug}
            onChange={(e) => router.push(`/painel/matches?colecao=${e.target.value}`)}
            className="max-w-xs"
          >
            {colecoes.map((c) => (
              <option key={c.id} value={c.slug}>{c.nome}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Filtros do mapa */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={() => setMostrarMapa((v) => !v)}
          className="text-xs font-semibold text-green-700 hover:underline flex items-center gap-1"
        >
          🗺️ {mostrarMapa ? 'Ocultar mapa' : 'Ver no mapa'}
        </button>
        {cidadesUnicas.length > 0 && (
          <select
            value={cidadeFiltro}
            onChange={(e) => setCidadeFiltro(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Todas as cidades ({matches.length})</option>
            {cidadesUnicas.map((c) => (
              <option key={c} value={c}>
                {c} ({matches.filter((m) => m.user_b_cidade === c).length})
              </option>
            ))}
          </select>
        )}
        {cidadeFiltro && (
          <button
            onClick={() => setCidadeFiltro('')}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Mapa */}
      {mostrarMapa && (
        <div className="mb-6">
          <Suspense fallback={
            <div className="w-full rounded-2xl bg-gray-100 flex items-center justify-center" style={{ height: 340 }}>
              <span className="text-gray-400 text-sm">Carregando mapa...</span>
            </div>
          }>
            <MapaMatches matches={matches} cidadeFiltro={cidadeFiltro} />
          </Suspense>
        </div>
      )}

      {/* Lista de matches */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        </div>
      ) : matchesFiltrados.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">😔</div>
          <h3 className="text-lg font-semibold mb-2">
            {cidadeFiltro ? `Nenhuma troca em ${cidadeFiltro}` : 'Nenhuma troca encontrada ainda'}
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            {cidadeFiltro
              ? 'Tente outra cidade ou limpe o filtro para ver todos.'
              : 'Adicione suas repetidas e faltantes para começar — quanto mais cromos cadastrados, maior a chance de encontrar trocas perfeitas.'}
          </p>
          {!cidadeFiltro && (
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => router.push('/painel/tenho')}>Cadastrar repetidas</Button>
              <Button onClick={() => router.push('/painel/preciso')}>Cadastrar faltantes</Button>
            </div>
          )}
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-ink-900">{matchesFiltrados.length}</span>{' '}
              {matchesFiltrados.length === 1 ? 'colecionador encontrado' : 'colecionadores encontrados'}
              {cidadeFiltro && <span className="ml-1 text-green-600 font-medium">em {cidadeFiltro}</span>}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {matchesFiltrados.map((m) => (
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
          setModalMatch(null);
        }}
      />
    </div>
  );
}
