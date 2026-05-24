import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Privacidade · TrocaCromos' };

export default async function PrivacidadePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="display text-3xl mb-6">Política de Privacidade</h1>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p><strong>Última atualização:</strong> Maio/2026 · Conforme LGPD (Lei 13.709/2018).</p>

          <h2 className="display text-xl mt-6">1. Dados que coletamos</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Dados de cadastro: nome, e-mail, senha (criptografada).</li>
            <li>Dados de perfil voluntários: cidade, bairro, foto, bio, WhatsApp, Instagram.</li>
            <li>Dados de uso: cromos cadastrados como repetidas e faltantes, propostas, conversas.</li>
            <li>Dados técnicos: endereço IP, navegador, dispositivo, para fins de segurança.</li>
          </ul>

          <h2 className="display text-xl mt-6">2. Finalidade</h2>
          <p>
            Usamos seus dados para: cruzar repetidas e faltantes entre usuários, exibir matches,
            permitir comunicação, autenticação, prevenção a fraude e melhorias do serviço.
          </p>

          <h2 className="display text-xl mt-6">3. Seus direitos (LGPD)</h2>
          <p>
            Você pode acessar, corrigir, portar ou excluir seus dados a qualquer momento em{' '}
            <strong>Configurações</strong> ou solicitando por e-mail. Pode também revogar consentimentos
            e solicitar anonimização.
          </p>

          <h2 className="display text-xl mt-6">4. Compartilhamento</h2>
          <p>
            Não vendemos dados pessoais. Compartilhamos com prestadores essenciais (Supabase para
            infraestrutura, Mercado Pago para pagamentos) sob contrato de confidencialidade.
          </p>

          <h2 className="display text-xl mt-6">5. Cookies</h2>
          <p>
            Usamos cookies essenciais para autenticação e cookies analíticos opcionais. Você pode
            recusar cookies não essenciais nas configurações do navegador.
          </p>

          <h2 className="display text-xl mt-6">6. Retenção</h2>
          <p>
            Mantemos dados enquanto sua conta estiver ativa. Após exclusão, removemos em até 30 dias,
            exceto dados que precisamos reter por obrigação legal (financeiros: 5 anos).
          </p>

          <h2 className="display text-xl mt-6">7. Encarregado (DPO)</h2>
          <p>
            Para questões sobre privacidade, contate: <strong>privacidade@trocacromos.com.br</strong>
          </p>
        </div>
      </main>
      <Disclaimer />
    </>
  );
}
