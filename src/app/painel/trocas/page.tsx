'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle, Badge, Avatar } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatRelativeDate } from '@/lib/utils';
import Link from 'next/link';

interface PropostaComUsuarios {
  id: string;
  remetente_id: string;
  destinatario_id: string;
  status: string;
  mensagem: string | null;
  forma_troca: string | null;
  oferta: any[];
  pedido: any[];
  criado_em: string;
  remetente: { id: string; nome: string; foto_url: string | null; cidade: string | null; estado: string | null };
  destinatario: { id: string; nome: string; foto_url: string | null; cidade: string | null; estado: string | null };
  colecao: { nome: string } | null;
}

export default function TrocasPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [recebidas, setRecebidas] = useState<PropostaComUsuarios[]>([]);
  const [enviadas, setEnviadas] = useState<PropostaComUsuarios[]>([]);
  const [tab, setTab] = useState<'recebidas' | 'enviadas' | 'fechadas'>('recebidas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const baseSelect = `
        id,remetente_id,destinatario_id,status,mensagem,forma_troca,oferta,pedido,criado_em,
        remetente:remetente_id(id,nome,foto_url,cidade,estado),
        destinatario:destinatario_id(id,nome,foto_url,cidade,estado),
        colecao:colecoes(nome)
      `;

      const [{ data: rec }, { data: env }] = await Promise.all([
        supabase.from('propostas').select(baseSelect).eq('destinatario_id', user.id).order('criado_em', { ascending: false }),
        supabase.from('propostas').select(baseSelect).eq('remetente_id', user.id).order('criado_em', { ascending: false }),
      ]);

      setRecebidas((rec ?? []) as any);
      setEnviadas((env ?? []) as any);
      setLoading(false);
    })();
  }, []);

  async function responder(propostaId: string, novoStatus: 'aceita' | 'rejeitada' | 'cancelada') {
    const supabase = createClient();
    const { error } = await supabase
      .from('propostas')
      .update({ status: novoStatus })
      .eq('id', propostaId);
    if (error) {
      alert('Erro: ' + error.message);
      return;
    }

    if (novoStatus === 'aceita') {
      const proposta = recebidas.find((p) => p.id === propostaId);
      if (proposta) {
        await supabase.from('acordos_troca').insert({
          proposta_id: propostaId,
          user_a: proposta.remetente_id,
          user_b: proposta.destinatario_id,
          itens_a_para_b: proposta.oferta,
          itens_b_para_a: proposta.pedido,
          forma_troca: proposta.forma_troca,
          status: 'aceito',
        });
        await supabase.from('notificacoes').insert({
          user_id: proposta.remetente_id,
          tipo: 'proposta_aceita',
          titulo: 'Sua proposta foi aceita 🎉',
          conteudo: `${proposta.destinatario.nome} aceitou sua proposta. Combine os detalhes pelo chat.`,
          link: `/painel/trocas`,
        });
      }
    }
    setRecebidas((prev) => prev.map((p) => p.id === propostaId ? { ...p, status: novoStatus } : p));
    setEnviadas((prev) => prev.map((p) => p.id === propostaId ? { ...p, status: novoStatus } : p));
  }

  const lista = tab === 'recebidas'
    ? recebidas.filter((p) => p.status === 'pendente')
    : tab === 'enviadas'
    ? enviadas.filter((p) => ['pendente','contraproposta'].includes(p.status))
    : [...recebidas, ...enviadas].filter((p) => ['aceita','rejeitada','expirada','cancelada'].includes(p.status));

  const pendentes = recebidas.filter((p) => p.status === 'pendente').length;
  const ativas = enviadas.filter((p) => p.status === 'pendente').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="display text-2xl mb-1">Minhas trocas</h1>
      <p className="text-sm text-gray-600 mb-5">Acompanhe as propostas recebidas, enviadas e os acordos fechados.</p>

      <div className="flex gap-2 mb-5 border-b border-ink-100">
        {([
          { k: 'recebidas', l: `Recebidas${pendentes > 0 ? ` (${pendentes})` : ''}` },
          { k: 'enviadas',  l: `Enviadas${ativas > 0 ? ` (${ativas})` : ''}` },
          { k: 'fechadas',  l: 'Fechadas' },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.k ? 'border-brand-green text-brand-green' : 'border-transparent hover:text-ink-900'
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <Card><div className="text-center py-12 text-gray-500">Carregando…</div></Card>
      ) : lista.length === 0 ? (
        <Card><div className="text-center py-12 text-gray-500">
          {tab === 'recebidas' && 'Nenhuma proposta recebida no momento.'}
          {tab === 'enviadas' && 'Você ainda não enviou propostas. Vá para a aba "Trocas encontradas".'}
          {tab === 'fechadas' && 'Nenhuma troca fechada ainda.'}
        </div></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {lista.map((p) => {
            const isReceived = p.destinatario_id === userId;
            const other = isReceived ? p.remetente : p.destinatario;
            return (
              <Card key={p.id}>
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={other.nome} src={other.foto_url} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{other.nome}</div>
                    <div className="text-xs text-gray-500">{other.cidade}, {other.estado}</div>
                  </div>
                  <Badge variant={
                    p.status === 'pendente' ? 'yellow' :
                    p.status === 'aceita' ? 'green' :
                    p.status === 'rejeitada' ? 'red' : 'gray'
                  }>
                    {p.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                    <div className="font-medium text-emerald-700">{isReceived ? 'Você recebe' : 'Você dá'}</div>
                    <div className="text-emerald-900 font-bold text-lg">{(isReceived ? p.oferta : p.oferta)?.length || 0}</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                    <div className="font-medium text-yellow-800">{isReceived ? 'Você dá' : 'Você recebe'}</div>
                    <div className="text-yellow-900 font-bold text-lg">{(isReceived ? p.pedido : p.pedido)?.length || 0}</div>
                  </div>
                </div>

                {p.mensagem && (
                  <div className="text-sm bg-ink-100 rounded-lg p-3 mb-3 italic">"{p.mensagem}"</div>
                )}

                <div className="text-xs text-gray-500 mb-3">{formatRelativeDate(p.criado_em)}</div>

                {p.status === 'pendente' && (
                  <div className="flex gap-2">
                    {isReceived ? (
                      <>
                        <Button onClick={() => responder(p.id, 'aceita')} size="sm" className="flex-1">Aceitar</Button>
                        <Button onClick={() => responder(p.id, 'rejeitada')} variant="secondary" size="sm" className="flex-1">Rejeitar</Button>
                      </>
                    ) : (
                      <Button onClick={() => responder(p.id, 'cancelada')} variant="secondary" size="sm" className="flex-1">
                        Cancelar proposta
                      </Button>
                    )}
                  </div>
                )}

                <Link href={`/perfil/${other.id}`} className="text-xs text-brand-green hover:underline mt-2 inline-block">
                  Ver perfil →
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
