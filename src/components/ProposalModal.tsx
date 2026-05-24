'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  if (!match) return null;

  async function enviar() {
    if (!match) return;
    setLoading(true);
    setErro(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Voce precisa estar logado.');

      // Verifica se ja existe conversa com esse usuario
      const { data: convExistente } = await supabase
        .from('conversas')
        .select('id')
        .or(`participante_a.eq.${user.id},participante_b.eq.${user.id}`)
        .or(`participante_a.eq.${match.user_b_id},participante_b.eq.${match.user_b_id}`)
        .limit(1)
        .maybeSingle();

      if (convExistente) {
        // Ja existe - redirecionar para conversa existente
        onSent();
        onClose();
        router.push(`/conversas/${convExistente.id}`);
        return;
      }

      // Cria proposta
      const { data: proposta, error: errProposta } = await supabase
        .from('propostas')
        .insert({
          remetente_id: user.id,
          destinatario_id: match.user_b_id,
          colecao_id: colecaoId,
          mensagem: mensagem || null,
          forma_troca: formaTroca,
        })
        .select()
        .single();
      if (errProposta) throw errProposta;

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

      // Mensagem automatica de sistema
      if (conversa) {
        await supabase.from('mensagens').insert({
          conversa_id: conversa.id,
          remetente_id: user.id,
          conteudo: `Proposta enviada: ${match.trocas_possiveis} trocas mutuas.${mensagem ? ' ' + mensagem : ''}`.trim(),
          tipo: 'sistema',
        });
      }

      onSent();
      onClose();

      // Redireciona para a conversa criada
      if (conversa) {
        router.push(`/conversas/${conversa.id}`);
      }
    } catch (e: any) {
      setErro(e.message || 'Erro ao enviar proposta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Enviar proposta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>{match.trocas_possiveis}</strong> troca{match.trocas_possiveis !== 1 ? 's' : ''} poss&iacute;vel com <strong>{match.user_b_nome || 'outro usu&aacute;rio'}</strong>
          </p>
        </div>

        <div className="mb-4">
          <Label htmlFor="formaTroca">Forma de troca</Label>
          <Select
            id="formaTroca"
            value={formaTroca}
            onChange={(e: any) => setFormaTroca(e.target.value)}
          >
            <option value="ambos">Presencial ou Correios</option>
            <option value="presencial">Presencial</option>
            <option value="correios">Correios</option>
          </Select>
        </div>

        <div className="mb-4">
          <Label htmlFor="mensagem">Mensagem (opcional)</Label>
          <Textarea
            id="mensagem"
            value={mensagem}
            onChange={(e: any) => setMensagem(e.target.value)}
            placeholder="Olá! Vi que temos cromos para trocar..."
            rows={3}
            className="resize-none"
          />
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={onClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={enviar} loading={loading} className="flex-1 bg-brand-green text-white">
            Enviar proposta
          </Button>
        </div>
      </div>
    </div>
  );
        }
