import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function ColecaoPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: colecao } = await supabase
    .from('colecoes')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!colecao) notFound();

  const { count: totalRepetidas } = await supabase
    .from('repetidas')
    .select('figurinhas!inner(colecao_id)', { count: 'exact', head: true })
    .eq('figurinhas.colecao_id', colecao.id);

  const { count: usuariosAtivos } = await supabase
    .from('repetidas')
    .select('user_id,figurinhas!inner(colecao_id)', { count: 'exact', head: true })
    .eq('figurinhas.colecao_id', colecao.id);

  return (
    <>
      <Navbar initialUser={user} />
      <main>
        <section className="bg-gradient-to-br from-brand-green to-brand-green-dark text-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Badge variant="yellow" className="mb-3">{colecao.categoria}</Badge>
            <h1 className="display text-4xl md:text-6xl mb-4">{colecao.nome}</h1>
            <p className="text-white/90 max-w-2xl text-lg mb-6">{colecao.descricao}</p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="display text-3xl text-brand-yellow">{colecao.total_figurinhas}</span>
                <div>cromos no total</div>
              </div>
              <div>
                <span className="display text-3xl text-brand-yellow">{usuariosAtivos ?? 0}</span>
                <div>colecionadores ativos</div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 flex-wrap">
              {user ? (
                <>
                  <Link href={`/painel/tenho?colecao=${colecao.slug}`}>
                    <Button variant="yellow" size="lg">Marcar minhas repetidas</Button>
                  </Link>
                  <Link href={`/painel/matches?colecao=${colecao.slug}`}>
                    <Button variant="secondary" size="lg">Ver trocas encontradas</Button>
                  </Link>
                </>
              ) : (
                <Link href="/signup">
                  <Button variant="yellow" size="lg">Criar conta grátis</Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="display text-2xl mb-4">Como completar o álbum {colecao.nome}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <div className="display text-3xl text-brand-yellow mb-2">01</div>
              <h3 className="font-bold mb-2">Cadastre suas repetidas</h3>
              <p className="text-sm text-gray-600">Toque nos números dos cromos que você tem em duplicata.</p>
            </Card>
            <Card>
              <div className="display text-3xl text-brand-yellow mb-2">02</div>
              <h3 className="font-bold mb-2">Marque o que falta</h3>
              <p className="text-sm text-gray-600">A gente busca quem mora perto e tem exatamente o que você precisa.</p>
            </Card>
            <Card>
              <div className="display text-3xl text-brand-yellow mb-2">03</div>
              <h3 className="font-bold mb-2">Combine e troque</h3>
              <p className="text-sm text-gray-600">Chat seguro, sem golpes. Presencial ou por envio.</p>
            </Card>
          </div>

          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <h3 className="display text-lg mb-2">📍 Encontre trocas na sua cidade</h3>
            <p className="text-sm text-gray-700 mb-4">
              Quanto mais perto, melhor: trocas presenciais são rápidas, sem custos de envio e mais
              seguras. Crie sua conta e veja imediatamente quem mora no seu bairro com cromos para trocar.
            </p>
            {!user && (
              <Link href="/signup">
                <Button>Quero ver quem está perto de mim</Button>
              </Link>
            )}
          </Card>
        </section>
      </main>
      <Disclaimer />
    </>
  );
}
