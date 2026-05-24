'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Avatar, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Disclaimer } from '@/components/Disclaimer';
import { checkAntiFraud } from '@/lib/antifraude';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { Mensagem } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

export default function ConversaPage() {
  const params = useParams();
  const router = useRouter();
  const conversaId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [other, setOther] = useState<{ id: string; nome: string; foto_url: string | null; verificado: boolean; reputacao: number } | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMsg, setNovaMsg] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark messages as read
  async function marcarLidas(userId: string) {
    const supabase = createClient();
    await supabase
      .from('mensagens')
      .update({ lida_em: new Date().toISOString() })
      .eq('conversa_id', conversaId)
      .neq('remetente_id', userId)
      .is('lida_em', null);
  }

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);

      const { data: conversa, error } = await supabase
        .from('conversas')
        .select('id,participante_a,participante_b')
        .eq('id', conversaId)
        .single();
      if (error || !conversa) { router.push('/conversas'); return; }

      const otherId = conversa.participante_a === u.id ? conversa.participante_b : conversa.participante_a;
      const { data: otherProfile } = await supabase
        .from('usuarios')
        .select('id,nome,foto_url,verificado,reputacao')
        .eq('id', otherId)
        .single();
      setOther(otherProfile as any);

      const { data: msgs } = await supabase
        .from('mensagens')
        .select('*')
        .eq('conversa_id', conversaId)
        .order('criado_em');
      setMensagens(msgs ?? []);

      // Mark incoming messages as read
      await marcarLidas(u.id);

      channel = supabase
        .channel(`conv:${conversaId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `conversa_id=eq.${conversaId}`,
        }, async (payload) => {
          setMensagens((prev) => {
            if (prev.some((m) => m.id === (payload.new as any).id)) return prev;
            return [...prev, payload.new as Mensagem];
          });
          // Auto-mark as read if message is from the other person
          if ((payload.new as any).remetente_id !== u.id) {
            await marcarLidas(u.id);
          }
        })
        .subscribe();
    })();

    return () => { if (channel) channel.unsubscribe(); };
  }, [conversaId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  async function enviar() {
    if (!novaMsg.trim() || !user) return;
    setEnviando(true);
    setAviso(null);
    const fraud = checkAntiFraud(novaMsg);
    if (fraud.flagged) {
      setAviso(fraud.warningMessage ?? 'Mensagem sinalizada.');
    }
    const supabase = createClient();
    // Garantir sessão válida (auto-refresh se necessário)
    const { data: sessData, error: sessErr } = await supabase.auth.getSession();
    if (sessErr || !sessData.session) {
      setAviso('Sessão expirada. Faça login novamente.');
      setEnviando(false);
      return;
    }
    const { error: insertErr } = await supabase.from('mensagens').insert({
      conversa_id: conversaId,
      remetente_id: user.id,
      conteudo: novaMsg.trim(),
      tipo: 'texto',
      flagged_antifraude: fraud.flagged,
    });
    if (insertErr) {
      setAviso('Erro ao enviar: ' + insertErr.message);
    } else {
      setNovaMsg('');
    }
    setEnviando(false);
  }

  return (
    <>
      <Navbar initialUser={user} />
      <div className="max-w-3xl mx-auto h-[calc(100vh-128px)] flex flex-col bg-white border-x border-ink-100">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-ink-100">
          <Link href="/conversas" className="text-2xl">←</Link>
          {other && (
            <>
              <Avatar name={other.nome} src={other.foto_url} />
              <div className="flex-1 min-w-0">
                <Link href={`/perfil/${other.id}`} className="font-semibold hover:underline">
                  {other.nome}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {other.verificado && <Badge variant="green">✓ Verificado</Badge>}
                  <span>⭐ {other.reputacao?.toFixed(1) || '—'}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-ink-100">
          {mensagens.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-12">
              Comece a conversa. Lembre-se: aqui é só para combinar trocas.
            </div>
          ) : (
            mensagens.map((m) => {
              const isMine = m.remetente_id === user?.id;
              if (m.tipo === 'sistema') {
                return (
                  <div key={m.id} className="text-center my-3">
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1.5 rounded-full">
                      🔔 {m.conteudo}
                    </span>
                  </div>
                );
              }
              return (
                <div key={m.id} className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
                  {!isMine && other && (
                    <Avatar name={other.nome} src={other.foto_url} size="sm" />
                  )}
                  <div className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                    isMine ? 'bg-brand-green text-white' : 'bg-white border border-ink-100'
                  )}>
                    {m.flagged_antifraude && (
                      <div className="text-[10px] mb-1 opacity-80 font-semibold">⚠️ Mensagem sinalizada</div>
                    )}
                    <div>{m.conteudo}</div>
                    <div className={cn('text-[10px] mt-1', isMine ? 'text-white/70' : 'text-gray-400')}>
                      {formatRelativeDate(m.criado_em)}
                      {isMine && m.lida_em && (
                        <span className="ml-1 opacity-80">✓✓</span>
                      )}
                    </div>
                  </div>
                  {isMine && user && (
                    <Avatar name={user.email || 'U'} src={null} size="sm" />
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Aviso antifraude */}
        {aviso && (
          <div className="bg-red-50 border-t border-red-200 px-4 py-2 text-sm text-red-700">
            ⚠️ {aviso}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-ink-100 bg-white">
          <div className="flex gap-2 items-end">
            <Textarea
              value={novaMsg}
              onChange={(e) => setNovaMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              rows={1}
              placeholder="Mensagem..."
              className="resize-none"
            />
            <Button onClick={enviar} loading={enviando} disabled={!novaMsg.trim()}>
              Enviar
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            🔒 Esta plataforma é exclusiva para trocas. Nunca aceite ofertas de venda, Pix ou pagamento.
          </p>
        </div>
      </div>
      <Disclaimer />
    </>
  );
            }
