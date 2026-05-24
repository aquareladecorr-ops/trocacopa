import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Anti-golpes · TrocaCromos' };

export default async function AntiGolpesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="display text-3xl mb-2">🛡️ Anti-golpes</h1>
        <p className="text-gray-600 mb-8">Trocar com segurança é fácil. Conheça os sinais e proteja-se.</p>

        <div className="space-y-4">
          <Card className="border-2 border-red-200">
            <div className="display text-xl text-red-700 mb-2">🚨 Sinais de golpe</div>
            <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
              <li>Pedir Pix, dinheiro ou comprovante de pagamento.</li>
              <li>Sugerir mover a conversa para fora do chat interno.</li>
              <li>Solicitar dados sensíveis (CPF, RG, cartão, senha).</li>
              <li>Urgência excessiva ("preciso até hoje", "última chance").</li>
              <li>Histórias emocionais para extorquir favores.</li>
              <li>Perfil novo, sem reputação, sem foto, sem trocas anteriores.</li>
              <li>Links suspeitos (bit.ly, encurtadores) na conversa.</li>
              <li>Códigos de rastreio "estranhos" ou recusa em enviar tracking.</li>
            </ul>
          </Card>

          <Card className="border-2 border-emerald-200">
            <div className="display text-xl text-emerald-700 mb-2">✅ Boas práticas</div>
            <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
              <li>Combine SEMPRE pelo chat interno (temos detector de fraude).</li>
              <li>Trocas presenciais em lugares públicos e movimentados.</li>
              <li>Envio postal? Use rastreio obrigatório e/ou seguro de troca.</li>
              <li>Tire fotos antes de enviar — evidência em caso de disputa.</li>
              <li>Veja reputação, verificação e histórico antes de confirmar.</li>
              <li>Comece pequeno: troque 1-2 cromos com pessoas novas antes de fazer trocas grandes.</li>
              <li>Avalie ao final — você ajuda a comunidade inteira.</li>
            </ul>
          </Card>

          <Card>
            <h2 className="display text-xl mb-3">Reportar comportamento suspeito</h2>
            <p className="text-sm text-gray-700 mb-4">
              Use o botão "Denunciar" no perfil ou na conversa. Anexe prints. Nossa equipe analisa
              em até 48h e, se procedente, banimos o usuário imediatamente.
            </p>
            <p className="text-sm text-gray-700">
              Em casos graves (extorsão, ameaça, fraude consumada): registre B.O. e nos envie o
              número — colaboramos com autoridades.
            </p>
          </Card>
        </div>
      </main>
      <Disclaimer />
    </>
  );
}
