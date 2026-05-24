import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Avatar, Card } from '@/components/ui/Card';
import { formatRelativeDate } from '@/lib/utils';

export default async function ConversasPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: conversas } = await supabase
    .from('conversas')
    .select(`
      id,participante_a,participante_b,ultima_msg_em,ultima_msg_preview,
      a:participante_a(id,nome,foto_url),
      b:participante_b(id,nome,foto_url)
    `)
    .or(`participante_a.eq.${user.id},participante_b.eq.${user.id}`)
    .order('ultima_msg_em', { ascending: false, nullsFirst: false });

  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="display text-2xl mb-5">Conversas</h1>

        {(!conversas || conversas.length === 0) ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              Nenhuma conversa ainda. Envie uma proposta para começar a conversar.
              <div className="mt-4">
                <Link href="/painel/matches" className="text-brand-green font-medium hover:underline">
                  Ver trocas encontradas →
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
            {conversas.map((c: any) => {
              const other = c.participante_a === user.id ? c.b : c.a;
              return (
                <Link
                  key={c.id}
                  href={`/conversas/${c.id}`}
                  className="flex items-center gap-3 p-4 border-b border-ink-100 last:border-b-0 hover:bg-ink-100 transition-colors"
                >
                  <Avatar name={other?.nome || '?'} src={other?.foto_url} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{other?.nome || 'Usuário'}</div>
                    <div className="text-sm text-gray-500 truncate">{c.ultima_msg_preview || 'Sem mensagens ainda'}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {c.ultima_msg_em && formatRelativeDate(c.ultima_msg_em)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
