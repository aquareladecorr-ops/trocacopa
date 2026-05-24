import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle, Badge } from '@/components/ui/Card';
import Link from 'next/link';

export default async function PainelPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: colecoes } = await supabase
    .from('colecoes')
    .select('id,slug,nome,total_figurinhas,categoria')
    .eq('ativa', true);

  const counts = await Promise.all(
    (colecoes ?? []).map(async (c) => {
      const { count: rep } = await supabase
        .from('repetidas')
        .select('figurinhas!inner(colecao_id)', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('figurinhas.colecao_id', c.id);
      const { count: falt } = await supabase
        .from('faltantes')
        .select('figurinhas!inner(colecao_id)', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('figurinhas.colecao_id', c.id);
      return { colecao: c, repetidas: rep ?? 0, faltantes: falt ?? 0 };
    })
  );

  const { count: propostasPendentes } = await supabase
    .from('propostas')
    .select('*', { count: 'exact', head: true })
    .eq('destinatario_id', user.id)
    .eq('status', 'pendente');

  const { count: trocasConcluidas } = await supabase
    .from('acordos_troca')
    .select('*', { count: 'exact', head: true })
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .eq('status', 'concluido');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="display text-3xl mb-1">Olá, {perfil?.nome?.split(' ')[0]}!</h1>
        <p className="text-gray-600 text-sm">
          {perfil?.cidade && (
            <>
              📍 {perfil.bairro && `${perfil.bairro}, `}{perfil.cidade}, {perfil.estado}
              {' · '}
            </>
          )}
          <Badge variant={perfil?.plano === 'free' ? 'gray' : 'yellow'}>
            {perfil?.plano?.toUpperCase()}
          </Badge>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <div className="text-xs uppercase text-gray-500 tracking-wide">Reputação</div>
          <div className="display text-3xl mt-1">⭐ {perfil?.reputacao?.toFixed(1) ?? '—'}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-gray-500 tracking-wide">Trocas concluídas</div>
          <div className="display text-3xl mt-1">{trocasConcluidas ?? 0}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-gray-500 tracking-wide">Propostas pendentes</div>
          <div className="display text-3xl mt-1 text-brand-green">{propostasPendentes ?? 0}</div>
          {(propostasPendentes ?? 0) > 0 && (
            <Link href="/painel/trocas" className="text-xs text-brand-green hover:underline">Ver agora →</Link>
          )}
        </Card>
        <Card>
          <div className="text-xs uppercase text-gray-500 tracking-wide">Cromo-coins</div>
          <div className="display text-3xl mt-1">{perfil?.cromo_coins ?? 0}</div>
        </Card>
      </div>

      {/* Coleções */}
      <h2 className="display text-xl mb-3">Minhas coleções</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {counts.map(({ colecao, repetidas, faltantes }) => {
          const tenhoUnicas = colecao.total_figurinhas - faltantes;
          const pct = colecao.total_figurinhas ? Math.round((tenhoUnicas / colecao.total_figurinhas) * 100) : 0;
          return (
            <Card key={colecao.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs uppercase text-gray-500">{colecao.categoria}</div>
                  <CardTitle>{colecao.nome}</CardTitle>
                </div>
                <Badge variant="green">{pct}% completo</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                <div>
                  <div className="text-gray-500 text-xs">Tenho únicas</div>
                  <div className="font-bold">{tenhoUnicas}/{colecao.total_figurinhas}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Repetidas</div>
                  <div className="font-bold text-emerald-700">{repetidas}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Faltam</div>
                  <div className="font-bold text-yellow-700">{faltantes}</div>
                </div>
              </div>

              <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-green" style={{ width: `${pct}%` }}></div>
              </div>

              <div className="flex gap-2 mt-4">
                <Link
                  href={`/painel/tenho?colecao=${colecao.slug}`}
                  className="flex-1 text-center text-sm py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium"
                >
                  Marcar repetidas
                </Link>
                <Link
                  href={`/painel/preciso?colecao=${colecao.slug}`}
                  className="flex-1 text-center text-sm py-2 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-medium"
                >
                  Marcar faltantes
                </Link>
              </div>

              <Link
                href={`/painel/matches?colecao=${colecao.slug}`}
                className="block mt-2 text-center text-sm py-2 rounded-lg bg-ink-900 text-white hover:bg-black font-medium"
              >
                Ver trocas encontradas →
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
