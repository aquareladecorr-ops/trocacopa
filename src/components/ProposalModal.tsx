'use client';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Textarea, Select, Label } from './ui/Input';
import type { MatchRow, FormaTroca } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface ProposalModalProps {
  match: MatchRow | null;
  colecaoId: string;
  onClose: () => void;
  onSent: () => void;
}

export function ProposalModal({ match, colecaoId, onClose, onSent }: ProposalModalProps) {
  const [mensagem, setMensagem] = useState('');
  const [formaTroca, setFormaTroca] = useState<FormaTroca>('ambos');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!match) return null;

  async function enviar() {
    if (!match) return;
    setLoading(true);
    setErro(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: proposta, error } = await supabase
        .from('propostas')
        .insert({
          remetente_id: user.id,
          destinatario_id: match.user_b_id,
          colecao_id: colecaoId,
          oferta: match.a_oferece,
          pedido: match.b_oferece,
          status: 'pendente',
          mensagem,
          forma_troca: formaTroca,
        })
        .select()
        .single();

      if (error) throw error;

      // Cria conversa associada
      const { data: conversa } = await supabase
        .from('conversas')
        .insert({
          participante_a: user.id,
          participante_b: match.user_b_id,
          proposta_id: proposta.id,
        })
        .select()
        .single();

      // Mensagem automática de sistema
      if (conversa) {
        await supabase.from('mensagens').insert({
          conversa_id: conversa.id,
          remetente_id: user.id,
          conteudo: `Proposta enviada: ${match.trocas_possiveis} trocas mútuas. ${mensagem || ''}`.trim(),
          tipo: 'sistema',
        });
      }

      // Notificação para o destinatário
      await supabase.from('notificacoes').insert({
        user_id: match.user_b_id,
        tipo: 'nova_proposta',
        titulo: 'Nova proposta de troca',
        conteudo: `Você recebeu uma nova proposta de troca com ${match.trocas_possiveis} cromos.`,
        link: `/conversas/${conversa?.id}`,
      });

      onSent();
      onClose();
    } catch (e: any) {
      setErro(e.message || 'Erro ao enviar proposta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="display text-xl mb-1">Propor troca com {match.user_b_nome}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {match.trocas_possiveis} trocas mútuas possíveis
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="text-xs font-medium text-emerald-700 uppercase">Você dá</div>
              <div className="text-2xl font-bold text-emerald-900 display">{match.a_oferece.length}</div>
              <div className="text-xs text-emerald-700">cromos</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <div className="text-xs font-medium text-yellow-800 uppercase">Você recebe</div>
              <div className="text-2xl font-bold text-yellow-900 display">{match.b_oferece.length}</div>
              <div className="text-xs text-yellow-800">cromos</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="forma_troca">Forma de troca preferida</Label>
              <Select
                id="forma_troca"
                value={formaTroca}
                onChange={(e) => setFormaTroca(e.target.value as FormaTroca)}
              >
                <option value="ambos">Presencial ou envio</option>
                <option value="presencial">Apenas presencial</option>
                <option value="envio">Apenas por envio (Correios)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="mensagem">Mensagem (opcional)</Label>
              <Textarea
                id="mensagem"
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Ex: Olá! Vi seu perfil e queria trocar. Que tal..."
              />
            </div>
          </div>

          {erro && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="mt-5 flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={enviar} loading={loading}>
              Enviar proposta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
