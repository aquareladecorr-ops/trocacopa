import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const PLANOS = [
  {
    nome: 'Free',
    preco: 'R$ 0',
    sub: '/ para sempre',
    cor: 'gray',
    features: [
      '10 propostas por dia',
      '20 matches visíveis por busca',
      '3 coleções ativas',
      'Chat interno',
      'Sistema de reputação',
    ],
    cta: 'Plano atual',
    disabled: true,
  },
  {
    nome: 'Premium',
    preco: 'R$ 9,90',
    sub: '/ mês',
    cor: 'green',
    destaque: true,
    features: [
      'Propostas ilimitadas',
      'Matches ilimitados',
      'Coleções ilimitadas',
      '"Visto recentemente" — saiba quando viram seu perfil',
      'Sem anúncios',
      'Selo Premium no perfil',
      'Prioridade no suporte',
    ],
    cta: 'Assinar Premium',
  },
  {
    nome: 'Plus',
    preco: 'R$ 19,90',
    sub: '/ mês',
    cor: 'purple',
    features: [
      'Tudo do Premium',
      'Match triangular (A→B→C→A)',
      'Perfis múltiplos (filhos)',
      'Verificação de identidade',
      'Seguro de troca incluso',
      'Análise de coleção por IA',
      'Acesso antecipado a beta features',
    ],
    cta: 'Assinar Plus',
  },
];

export default async function PremiumPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Navbar initialUser={user} />
      <main>
        <section className="bg-ink-900 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-brand-yellow text-ink-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
              ASSINATURA OPCIONAL
            </div>
            <h1 className="display text-4xl md:text-6xl mb-4">
              Troque mais. <span className="text-brand-yellow">Pague menos pacote.</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              O grátis dá conta da maioria. Quem quer turbinar a coleção tem 2 caminhos: Premium para
              o trocador ativo, Plus para o colecionador hardcore.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-5">
            {PLANOS.map((p) => (
              <Card
                key={p.nome}
                className={`relative ${p.destaque ? 'border-2 border-brand-green shadow-lg scale-105' : ''}`}
              >
                {p.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-yellow text-ink-900 text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="display text-xl">{p.nome}</h3>
                <div className="mt-2 mb-4">
                  <span className="display text-4xl">{p.preco}</span>
                  <span className="text-sm text-gray-500">{p.sub}</span>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-brand-green">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {p.disabled ? (
                  <Button variant="secondary" className="w-full" disabled>{p.cta}</Button>
                ) : (
                  <form action="/api/pagamentos/checkout" method="POST">
                    <input type="hidden" name="plano" value={p.nome.toLowerCase()} />
                    <Button type="submit" variant={p.destaque ? 'primary' : 'secondary'} className="w-full">
                      {user ? p.cta : 'Criar conta'}
                    </Button>
                  </form>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-gray-600">
            <p>Pagamentos seguros via Mercado Pago. Cancele a qualquer momento.</p>
            <p className="mt-2">Dúvidas? <Link href="/anti-golpes" className="text-brand-green underline">Suporte</Link></p>
          </div>
        </section>
      </main>
      <Disclaimer />
    </>
  );
}
