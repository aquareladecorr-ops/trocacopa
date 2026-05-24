import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Anuncie · TrocaCromos' };

const PACOTES = [
  { nome: 'Local Básico', preco: 'R$ 49', sub: '/ mês', desc: '1 bairro, 1 anúncio, até 5 mil impressões.' },
  { nome: 'Local Plus', preco: 'R$ 149', sub: '/ mês', desc: 'Até 3 bairros, 3 anúncios, segmentação refinada.' },
  { nome: 'Cidade', preco: 'R$ 490', sub: '/ mês', desc: 'Cidade inteira, banner premium em listagens.' },
  { nome: 'Estado', preco: 'R$ 1.490', sub: '/ mês', desc: 'Cobertura estadual + relatório de performance.' },
];

export default async function AnunciantePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Navbar initialUser={user} />
      <main>
        <section className="bg-brand-yellow text-ink-900 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="display text-4xl md:text-6xl mb-4">
              Anuncie para colecionadores apaixonados.
            </h1>
            <p className="text-lg max-w-2xl">
              Bancas, papelarias, lojas de colecionáveis, organizadores de eventos — alcance um
              público hipersegmentado por cidade, bairro e coleção. Sem desperdício.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="display text-2xl mb-6">Pacotes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACOTES.map((p) => (
              <Card key={p.nome}>
                <div className="font-semibold text-sm text-gray-500 uppercase">{p.nome}</div>
                <div className="display text-3xl mt-1">{p.preco}<span className="text-sm text-gray-500">{p.sub}</span></div>
                <p className="text-sm text-gray-700 mt-2 mb-4 leading-relaxed">{p.desc}</p>
                <Button variant="secondary" className="w-full">Saiba mais</Button>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="display text-lg mb-2">Anuncie um evento</h3>
              <p className="text-sm text-gray-700 mb-3">
                Tem uma feira ou encontro de colecionadores? Destaque-o para a região, atraia público
                qualificado e cobre patrocínio.
              </p>
              <Button>Anunciar evento</Button>
            </Card>
            <Card>
              <h3 className="display text-lg mb-2">Parcerias B2B</h3>
              <p className="text-sm text-gray-700 mb-3">
                Editoras, redes de bancas, organizadores de campeonatos — converse sobre licenciamento
                do motor de match e integrações white-label.
              </p>
              <Button variant="secondary">Falar com vendas</Button>
            </Card>
          </div>
        </section>
      </main>
      <Disclaimer />
    </>
  );
}
