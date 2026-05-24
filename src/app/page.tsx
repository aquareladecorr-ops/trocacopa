import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count: totalUsuarios } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true });

  const { data: colecoes } = await supabase
    .from('colecoes')
    .select('*')
    .eq('ativa', true)
    .order('criado_em', { ascending: false });

  return (
    <>
      <Navbar initialUser={user} />

      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-green via-brand-green to-brand-green-dark text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-9xl display rotate-12">⚽</div>
          <div className="absolute bottom-10 right-20 text-9xl display -rotate-12">🏆</div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 relative">
          <div className="bg-brand-yellow text-ink-900 inline-block px-3 py-1 rounded-full text-xs font-bold mb-5">
            COMUNIDADE INDEPENDENTE · MUNDIAL 2026
          </div>
          <h1 className="display text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 max-w-3xl">
            Pare de gastar com pacotes.
            <br />
            <span className="text-brand-yellow">Troque com quem tem o que falta.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">
            A maior comunidade independente de colecionadores do Brasil. Cadastre suas repetidas e
            faltantes — a gente encontra automaticamente quem mora perto e tem exatamente o que
            você precisa.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="bg-brand-yellow text-ink-900 px-6 py-3.5 rounded-xl font-bold hover:scale-105 transition-transform shadow-stamp"
            >
              Quero completar meu álbum — é grátis
            </Link>
            <Link
              href="/login"
              className="bg-white/10 backdrop-blur border-2 border-white/30 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-white/20"
            >
              Já tenho conta
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-white/80">
            <div>
              <span className="display text-3xl text-brand-yellow">{(totalUsuarios ?? 0).toLocaleString('pt-BR')}+</span>
              <div>colecionadores</div>
            </div>
            <div className="h-10 w-px bg-white/30"></div>
            <div>
              <span className="display text-3xl text-brand-yellow">{colecoes?.length ?? 0}</span>
              <div>coleções ativas</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="display text-3xl md:text-5xl text-center mb-3">Como funciona</h2>
          <p className="text-center text-gray-600 mb-12">3 passos para fechar seu álbum sem gastar mais nada.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', t: 'Cadastre em 5 minutos', d: 'Toque nos números das suas repetidas e das que faltam. Por foto, lista numérica ou grade visual.' },
              { n: '02', t: 'A gente acha quem combina', d: 'Match automático na sua cidade e bairro. Você só vê quem tem o que você precisa — e precisa do que você tem.' },
              { n: '03', t: 'Converse, combine e troque', d: 'Pelo chat seguro com antifraude, avaliação pós-troca e seguro de envio opcional.' },
            ].map((s) => (
              <div key={s.n} className="bg-white rounded-2xl p-6 border-2 border-ink-100 hover:border-brand-green transition-colors">
                <div className="display text-5xl text-brand-yellow mb-3">{s.n}</div>
                <h3 className="display text-xl mb-2">{s.t}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COLEÇÕES */}
      <section className="py-16 px-4 bg-ink-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="display text-3xl md:text-4xl mb-2">Não é só Mundial.</h2>
          <p className="text-gray-600 mb-8">Brasileirão, TCGs, álbuns infantis. Uma plataforma, todas as coleções.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colecoes?.map((c) => (
              <Link
                key={c.id}
                href={`/colecao/${c.slug}`}
                className="bg-white rounded-xl p-5 border-2 border-ink-100 hover:border-brand-green transition-colors"
              >
                <div className="text-xs uppercase text-gray-500 tracking-wide">{c.categoria}</div>
                <div className="display text-lg mt-1">{c.nome}</div>
                <div className="text-sm text-gray-500 mt-1">{c.total_figurinhas} cromos</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="display text-3xl md:text-5xl text-center mb-12">Quem trocou, contou.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: 'Carlos', c: 'São Paulo', t: 'Completei 80 figurinhas em duas semanas. Não comprei mais nenhum pacote.' },
              { n: 'Marina', c: 'Belo Horizonte', t: 'Achei o cromo do meu craque favorito em 10 minutos. Mora a 2 km de mim.' },
              { n: 'Ricardo', c: 'Curitiba', t: 'Família inteira completou o álbum trocando. Economizamos uns R$ 600.' },
            ].map((t) => (
              <div key={t.n} className="bg-white rounded-2xl p-6 border border-ink-100 shadow-sm">
                <p className="text-gray-700 italic mb-4 leading-relaxed">"{t.t}"</p>
                <div className="text-sm">
                  <div className="font-semibold">{t.n}</div>
                  <div className="text-gray-500 text-xs">{t.c}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="py-16 px-4 bg-ink-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="display text-3xl md:text-4xl mb-3">Trocar com segurança.</h2>
          <p className="text-white/70 mb-10 max-w-2xl">
            Sistemas de confiança ativos desde o primeiro dia. Você troca, a gente protege.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { t: 'Chat com antifraude', d: 'Detectamos padrões de golpe.' },
              { t: 'Reputação verificada', d: 'Avaliação obrigatória após cada troca.' },
              { t: 'Seguro de troca', d: 'Proteção para envios postais.' },
              { t: 'Mediação 24/48h', d: 'Resolvemos disputas com evidências.' },
            ].map((s) => (
              <div key={s.t} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="font-semibold mb-1">{s.t}</div>
                <div className="text-sm text-white/70">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-brand-yellow">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="display text-4xl md:text-6xl mb-4 text-ink-900">
            Comece a trocar hoje.
          </h2>
          <p className="text-ink-900/80 text-lg mb-8">
            Cadastro grátis. Sem cartão. Sem letra miúda.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-ink-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black shadow-stamp"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>

      <Disclaimer />

      <footer className="bg-ink-900 text-gray-500 text-xs py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-between items-center">
          <span>© 2026 TrocaCromos · Plataforma independente</span>
          <div className="flex gap-4">
            <Link href="/termos" className="hover:text-white">Termos</Link>
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
            <Link href="/anti-golpes" className="hover:text-white">Anti-golpes</Link>
            <Link href="/anunciante" className="hover:text-white">Anuncie</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
