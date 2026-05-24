import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nome,foto_url,plano,onboarding_completo,cidade,bairro,estado')
    .eq('id', user.id)
    .single();

  if (perfil && !perfil.onboarding_completo) redirect('/onboarding');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar initialUser={user} initialProfile={perfil} />
      <div className="bg-white border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {[
              { href: '/painel', l: 'Visão geral' },
              { href: '/painel/tenho', l: 'Tenho' },
              { href: '/painel/preciso', l: 'Preciso' },
              { href: '/painel/matches', l: 'Trocas encontradas' },
              { href: '/painel/trocas', l: 'Minhas trocas' },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:border-brand-green hover:text-brand-green whitespace-nowrap transition-colors"
              >
                {t.l}
              </Link>
            ))}
            <Link
              href="/conversas"
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:border-brand-green hover:text-brand-green whitespace-nowrap transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Conversas
            </Link>
          </div>
        </div>
      </div>
      <main className="flex-1 bg-ink-100">{children}</main>
      <Disclaimer />
    </div>
  );
}
