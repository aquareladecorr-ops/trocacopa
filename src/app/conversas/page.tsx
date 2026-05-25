'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Avatar, Card } from '@/components/ui/Card';
import { formatRelativeDate } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface ConversaItem {
  id: string;
  participante_a: string;
  participante_b: string;
  ultima_msg_em: string | null;
  ultima_msg_preview: string | null;
  other: { id: string; nome: string; foto_url: string | null } | null;
  unread: number;
}

export default function ConversasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversas, setConversas] = useState<ConversaItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadConversas(u: User) {
    const supabase = createClient();
    const { data: conversasRaw } = await supabase
      .from('conversas')
      .select('id,participante_a,participante_b,ultima_msg_em,ultima_msg_preview')
      .or(`participante_a.eq.${u.id},participante_b.eq.${u.id}`)
      .order('ultima_msg_em', { ascending: false, nullsFirst: false });

    const otherIds = (conversasRaw || []).map((c: any) =>
      c.participante_a === u.id ? c.participante_b : c.participante_a
    ).filter(Boolean);
    const uniqueIds = [...new Set(otherIds)] as string[];

    let perfisMap: Record<string, any> = {};
    if (uniqueIds.length > 0) {
      const { data: perfis } = await supabase
        .from('usuarios')
        .select('id,nome,foto_url')
        .in('id', uniqueIds);
      (perfis || []).forEach((p: any) => { perfisMap[p.id] = p; });
    }

    // Count unread per conversation
    const convIds = (conversasRaw || []).map((c: any) => c.id);
    let unreadMap: Record<string, number> = {};
    if (convIds.length > 0) {
      const { data: unreadRows } = await supabase
        .from('mensagens')
        .select('conversa_id')
        .in('conversa_id', convIds)
        .neq('remetente_id', u.id)
        .is('lida_em', null);
      (unreadRows || []).forEach((m: any) => {
        unreadMap[m.conversa_id] = (unreadMap[m.conversa_id] || 0) + 1;
      });
    }

    const items = (conversasRaw || []).map((c: any) => {
      const otherId = c.participante_a === u.id ? c.participante_b : c.participante_a;
      return {
        ...c,
        other: perfisMap[otherId] || null,
        unread: unreadMap[c.id] || 0,
      };
    });

    setConversas(items);
    setLoading(false);
  }

  useEffect(() => {
    const supabase = createClient();
    let channel: any = null;

    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);
      await loadConversas(u);

      // Subscribe to new messages to update unread counts and conversation order
      channel = supabase
        .channel('conversas-list')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
        }, async () => {
          // Reload conversations on any new message
          await loadConversas(u);
        })
        .subscribe();
    })();

    return () => { if (channel) channel.unsubscribe(); };
  }, []);

  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="display text-2xl mb-5">Conversas</h1>
        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando...</div>
        ) : (!conversas || conversas.length === 0) ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              Nenhuma conversa ainda. Envie uma proposta para começar a conversar.
              <div className="mt-4">
                <Link href="/painel/matches" className="text-brand-green font-medium hover:underline">
                  Ver trocas encontradas &rarr;
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
            {conversas.map((c: ConversaItem) => (
              <Link
                key={c.id}
                href={`/conversas/${c.id}`}
                className="flex items-center gap-3 p-4 border-b border-ink-100 last:border-b-0 hover:bg-ink-100 transition-colors"
              >
                <div className="relative">
                  <Avatar name={c.other?.nome || '?'} src={c.other?.foto_url} />
                  {c.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-green text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                      {c.unread > 9 ? '9+' : c.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate ${c.unread > 0 ? 'text-ink-900' : ''}`}>
                    {c.other?.nome || 'Usuário'}
                  </div>
                  <div className={`text-sm truncate ${c.unread > 0 ? 'text-ink-900 font-medium' : 'text-gray-500'}`}>
                    {c.ultima_msg_preview || 'Sem mensagens ainda'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-gray-400">
                    {c.ultima_msg_em && formatRelativeDate(c.ultima_msg_em)}
                  </div>
                  {c.unread > 0 && (
                    <span className="bg-brand-green text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold">
                      {c.unread}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
                                                      }
