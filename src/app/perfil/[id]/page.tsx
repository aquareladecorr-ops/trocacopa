import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card, Avatar, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function PerfilPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user: viewer } } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!perfil) notFound();

  const { count: repetidas } = await supabase
    .from('repetidas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', params.id);

  const { count: faltantes } = await supabase
    .from('faltantes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', params.id);

  const { data: avaliacoes } = await supabase
    .from('avaliacoes')
    .select(`
      id,nota,comentario,criado_em,
      avaliador:avaliador_id(nome,foto_url)
    `)
    .eq('avaliado_id', params.id)
    .order('criado_em', { ascending: false })
    .limit(10);

  const isOwn = viewer?.id === perfil.id;

  return (
    <>
      <Navbar initialUser={viewer} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <div className="flex items-start gap-4">
            <Avatar name={perfil.nome} src={perfil.foto_url} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="display text-2xl">{perfil.nome}</h1>
                {perfil.verificado && <Badge variant="green">✓ Verificado</Badge>}
                {perfil.plano === 'premium' && <Badge variant="yellow">PREMIUM</Badge>}
                {perfil.plano === 'plus' && <Badge variant="purple">PLUS</Badge>}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                📍 {perfil.bairro && `${perfil.bairro}, `}{perfil.cidade}, {perfil.estado}
              </p>
              {perfil.bio && <p className="text-sm text-gray-700 mt-3">{perfil.bio}</p>}

              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <div className="display text-xl">⭐ {perfil.reputacao?.toFixed(1) || '—'}</div>
                  <div className="text-xs text-gray-500">Reputação</div>
                </div>
                <div>
                  <div className="display text-xl">{perfil.trocas_concluidas}</div>
                  <div className="text-xs text-gray-500">Trocas</div>
                </div>
                <div>
                  <div className="display text-xl text-emerald-700">{repetidas ?? 0}</div>
                  <div className="text-xs text-gray-500">Repetidas</div>
                </div>
                <div>
                  <div className="display text-xl text-yellow-700">{faltantes ?? 0}</div>
                  <div className="text-xs text-gray-500">Faltantes</div>
                </div>
              </div>
            </div>
            {!isOwn && viewer && (
              <Link href={`/conversas?with=${perfil.id}`}>
                <Button>Conversar</Button>
              </Link>
            )}
            {isOwn && (
              <Link href="/configuracoes">
                <Button variant="secondary">Editar perfil</Button>
              </Link>
            )}
          </div>
        </Card>

        <h2 className="display text-xl mb-3">Avaliações recentes</h2>
        {(!avaliacoes || avaliacoes.length === 0) ? (
          <Card><div className="text-gray-500 text-center py-6 text-sm">Sem avaliações ainda.</div></Card>
        ) : (
          <div className="space-y-3">
            {avaliacoes.map((av: any) => (
              <Card key={av.id}>
                <div className="flex items-start gap-3">
                  <Avatar name={av.avaliador?.nome || '?'} src={av.avaliador?.foto_url} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{av.avaliador?.nome || 'Usuário'}</span>
                      <span className="text-yellow-500">{'⭐'.repeat(av.nota)}</span>
                    </div>
                    {av.comentario && <p className="text-sm text-gray-700 mt-1">{av.comentario}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(av.criado_em).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Disclaimer />
    </>
  );
}
