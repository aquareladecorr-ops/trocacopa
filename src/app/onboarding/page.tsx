'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Select, Label } from '@/components/ui/Input';

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [estado, setEstado] = useState('SP');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappOculto, setWhatsappOculto] = useState(true);
  const [formaTroca, setFormaTroca] = useState('ambos');
  const [contatoPreferido, setContatoPreferido] = useState('chat_interno');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
    })();
  }, [router]);

  async function salvar() {
    if (!userId) return;
    setLoading(true);
    setErro(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('usuarios')
        .update({
          cidade,
          bairro: bairro || null,
          estado,
          whatsapp: whatsapp || null,
          whatsapp_oculto: whatsappOculto,
          forma_troca: formaTroca,
          contato_preferido: contatoPreferido,
          onboarding_completo: true,
        })
        .eq('id', userId);

      if (error) throw error;
      router.push('/painel');
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-100 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="display text-2xl text-center mb-2">
          <span className="text-brand-green">Troca</span><span className="text-ink-900">Cromos</span>
        </div>
        <p className="text-center text-sm text-gray-600 mb-6">Passo {step} de 2</p>

        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-brand-green' : 'bg-ink-100'}`}></div>
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-brand-green' : 'bg-ink-100'}`}></div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-ink-100">
          {step === 1 && (
            <>
              <h1 className="display text-2xl mb-2">Onde você está?</h1>
              <p className="text-sm text-gray-600 mb-6">
                Vamos achar colecionadores próximos. Não pedimos endereço — só cidade e bairro.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input id="cidade" required value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Opcional" />
                  </div>
                  <div>
                    <Label htmlFor="estado">UF</Label>
                    <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                      {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => setStep(2)}
                disabled={!cidade.trim()}
              >
                Próximo
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="display text-2xl mb-2">Como você prefere trocar?</h1>
              <p className="text-sm text-gray-600 mb-6">Você pode mudar a qualquer momento.</p>

              <div className="space-y-4">
                <div>
                  <Label>Forma preferida de troca</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: 'presencial', l: 'Presencial' },
                      { v: 'envio', l: 'Por envio' },
                      { v: 'ambos', l: 'Ambos' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setFormaTroca(opt.v)}
                        className={`px-3 py-3 rounded-xl border-2 text-sm font-medium ${
                          formaTroca === opt.v ? 'border-brand-green bg-emerald-50 text-emerald-700' : 'border-ink-100'
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                  <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" />
                  {whatsapp && (
                    <label className="flex items-start gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whatsappOculto}
                        onChange={(e) => setWhatsappOculto(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>Ocultar meu WhatsApp publicamente — só revela após aceitar a proposta.</span>
                    </label>
                  )}
                </div>

                <div>
                  <Label>Contato preferido</Label>
                  <Select value={contatoPreferido} onChange={(e) => setContatoPreferido(e.target.value)}>
                    <option value="chat_interno">Chat interno (mais seguro)</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                  </Select>
                </div>
              </div>

              {erro && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{erro}</div>
              )}

              <div className="flex gap-2 mt-6">
                <Button variant="secondary" onClick={() => setStep(1)} disabled={loading}>Voltar</Button>
                <Button className="flex-1" size="lg" onClick={salvar} loading={loading}>
                  Concluir e começar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
