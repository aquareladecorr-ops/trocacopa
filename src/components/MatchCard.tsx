'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Badge } from './ui/Card';
import { Button } from './ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { MatchRow } from '@/lib/types';

interface MatchCardProps {
  match: MatchRow;
  onPropose: (match: MatchRow) => void;
}

export function MatchCard({ match, onPropose }: MatchCardProps) {
  const [loadingChat, setLoadingChat] = useState(false);
  const router = useRouter();

  async function abrirConversa() {
    setLoadingChat(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Verifica se já existe conversa entre os dois usuários
      const { data: existente } = await supabase
        .from('conversas')
        .select('id')
        .or(`and(participante_a.eq.${user.id},participante_b.eq.${match.user_b_id}),and(participante_a.eq.${match.user_b_id},participante_b.eq.${user.id})`)
        .maybeSingle();

      if (existente) {
        router.push(`/conversas/${existente.id}`);
        return;
      }

      // Cria nova conversa
      const { data: nova, error } = await supabase
        .from('conversas')
        .insert({ participante_a: user.id, participante_b: match.user_b_id })
        .select('id')
        .single();

      if (error || !nova) {
        console.error('Erro ao criar conversa:', error);
        return;
      }

      router.push(`/conversas/${nova.id}`);
    } finally {
      setLoadingChat(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Avatar name={match.user_b_nome} src={match.user_b_foto_url} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/perfil/${match.user_b_id}`}
                className="font-semibold text-ink-900 hover:underline truncate"
              >
                {match.user_b_nome}
              </Link>
              {match.user_b_verificado && <Badge variant="green">✓ Verificado</Badge>}
              {match.user_b_plano === 'premium' && <Badge variant="yellow">Premium</Badge>}
              {match.user_b_plano === 'plus' && <Badge variant="purple">Plus</Badge>}
            </div>
            <div className="text-sm text-gray-600 mt-0.5">
              {match.user_b_bairro && <span>{match.user_b_bairro} · </span>}
              {match.user_b_cidade}, {match.user_b_estado}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span>⭐ {match.user_b_reputacao?.toFixed(1) || '–'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-green display">{match.trocas_possiveis}</div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wide">trocas</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="font-medium text-emerald-700 mb-1">VOCÊ DÁ</div>
            <div className="text-emerald-900 font-mono leading-relaxed">
              {match.a_oferece.slice(0, 8).map((i: any) => i.figurinha_id ? '✓' : '').join(' ')}
              {match.a_oferece.length} cromos
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="font-medium text-yellow-800 mb-1">VOCÊ RECEBE</div>
            <div className="text-yellow-900 font-mono leading-relaxed">
              {match.b_oferece.length} cromos
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex gap-2">
        <Button onClick={() => onPropose(match)} className="flex-1">
          Propor troca
        </Button>
        <Button
          onClick={abrirConversa}
          variant="secondary"
          className="flex-1"
          loading={loadingChat}
        >
          💬 Conversar
        </Button>
        <Link href={`/perfil/${match.user_b_id}`}>
          <Button variant="secondary">Ver perfil</Button>
        </Link>
      </div>
    </div>
  );
              }
