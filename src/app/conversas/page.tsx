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

  // Busca conversas sem join ambíguo - depois busca perfis separadamente
  const { data: conversasRaw } = await supabase
    .from('conversas')
    .select('id,participante_a,participante_b,ultima_msg_em,ultima_msg_preview')
    .or(`participante_a.eq.${user.id},participante_b.eq.${user.id}`)
    .order('ultima_msg_em', { ascending: false, nullsFirst: false });

  // Coleta IDs únicos dos outros participantes
  const otherIds = (conversasRaw || []).map((c: any) =>
    c.participante_a === user.id ? c.participante_b : c.participante_a
  ).filter(Boolean);

  const uniqueIds = [...new Set(otherIds)] as string[];

  // Busca perfis dos outros participantes
  let perfisMap: Record<string, any> = {};
  if (uniqueIds.length > 0) {
    const { data: perfis } = await supabase
      .from('usuarios')
      .select('id,nome,foto_url')
      .in('id', uniqueIds);
    (perfis || []).forEach((p: any) => { perfisMap[p.id] = p; });
  }

  // Monta lista com perfil do outro
  const conversas = (conversasRaw || []).map((c: any) => {
    const otherId = c.participante_a === user.id ? c.participante_b : c.participante_a;
    return { ...c, other: perfisMap[otherId] || null };
  });

  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="display text-2xl mb-5">Conversas</h1>

        {(!conversas || conversas.length === 0) ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              Nenhuma conversa ainda. Envie uma proposta para come&ccedil;ar a conversar.
              <div className="mt-4">
                <Link href="/painel/matches" className="text-brand-green font-medium hover:underline">
                  Ver trocas encontradas &rarr;
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
            {conversas.map((c: any) => (
              <Link
                key={c.id}
                href={`/conversas/${c.id}`}
                className="flex items-center gap-3 p-4 border-b border-ink-100 last:border-b-0 hover:bg-ink-100 transition-colors"
              >
                <Avatar name={c.other?.nome || '?'} src={c.other?.foto_url} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.other?.nome || 'Usu&aacute;rio'}</div>
                  <div className="text-sm text-gray-500 truncate">{c.ultima_msg_preview || 'Sem mensagens ainda'}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {c.ultima_msg_em && formatRelativeDate(c.ultima_msg_em)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
                }
