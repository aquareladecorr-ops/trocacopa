import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Termos de Uso · TrocaCromos' };

export default async function TermosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="display text-3xl mb-6">Termos de Uso</h1>
        <div className="prose prose-sm max-w-none space-y-4 text-sm text-gray-700 leading-relaxed">
          <p><strong>Última atualização:</strong> Maio/2026</p>

          <h2 className="display text-xl mt-6">1. Plataforma independente</h2>
          <p>
            TrocaCromos é um serviço independente operado por seus titulares, sem qualquer vínculo,
            patrocínio, autorização ou endosso por parte da FIFA, Panini, CBF, ligas de futebol,
            editoras de álbuns oficiais ou quaisquer entidades esportivas ou comerciais. Marcas
            mencionadas no contexto educacional ou descritivo pertencem aos seus respectivos titulares.
          </p>

          <h2 className="display text-xl mt-6">2. Natureza do serviço</h2>
          <p>
            Oferecemos uma ferramenta para que colecionadores se encontrem e organizem trocas de
            cromos, cards e itens colecionáveis. A plataforma <strong>não realiza vendas</strong>,
            <strong> não intermedia pagamentos entre usuários</strong> e não é responsável pelo
            cumprimento das trocas combinadas pelas partes.
          </p>

          <h2 className="display text-xl mt-6">3. Cadastro</h2>
          <p>
            O cadastro é gratuito e requer dados verídicos. Menores de idade só podem usar a
            plataforma com supervisão e autorização de responsáveis legais. Você é responsável por
            manter seus dados de acesso seguros.
          </p>

          <h2 className="display text-xl mt-6">4. Conduta</h2>
          <p>
            É vedado: oferecer venda de produtos (somente troca), praticar fraude, assediar outros
            usuários, usar a plataforma para fins ilícitos, ou tentar burlar mecanismos de segurança.
            Violações resultam em banimento e podem ser reportadas a autoridades.
          </p>

          <h2 className="display text-xl mt-6">5. Trocas e responsabilidades</h2>
          <p>
            As trocas são acordos diretos entre usuários. A TrocaCromos disponibiliza ferramentas
            (chat, avaliação, denúncia, opcionalmente seguro de envio), mas não garante o cumprimento
            das trocas. Em caso de disputa, atuamos como mediadores com base em evidências fornecidas.
          </p>

          <h2 className="display text-xl mt-6">6. Planos pagos</h2>
          <p>
            Premium e Plus são assinaturas opcionais. Cancelamento pode ser feito a qualquer momento.
            Reembolsos seguem o Código de Defesa do Consumidor brasileiro.
          </p>

          <h2 className="display text-xl mt-6">7. Privacidade</h2>
          <p>
            Tratamos dados conforme nossa <a href="/privacidade" className="text-brand-green underline">Política de Privacidade</a> e a LGPD.
          </p>

          <h2 className="display text-xl mt-6">8. Limitação de responsabilidade</h2>
          <p>
            Na máxima extensão permitida por lei, a TrocaCromos não se responsabiliza por danos
            indiretos decorrentes de trocas mal sucedidas, perda de itens em envios postais (salvo
            seguro contratado) ou conflitos entre usuários.
          </p>

          <h2 className="display text-xl mt-6">9. Alterações</h2>
          <p>
            Podemos alterar estes termos a qualquer momento. Mudanças significativas serão
            comunicadas por e-mail e notificação na plataforma.
          </p>

          <h2 className="display text-xl mt-6">10. Foro</h2>
          <p>Fica eleito o foro de São Paulo/SP para dirimir quaisquer questões.</p>
        </div>
      </main>
      <Disclaimer />
    </>
  );
}
