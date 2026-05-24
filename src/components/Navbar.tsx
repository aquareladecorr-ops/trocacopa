'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from './ui/Card';
import { Button } from './ui/Button';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  initialUser?: User | null;
  initialProfile?: { nome: string; foto_url: string | null; plano: string } | null;
}

export function Navbar({ initialUser, initialProfile }: NavbarProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [profile, setProfile] = useState(initialProfile ?? null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifs, setNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('usuarios')
          .select('nome,foto_url,plano')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);

        // Notificações gerais
        const { count: notifCount } = await supabase
          .from('notificacoes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('lida', false);
        setNotifs(notifCount ?? 0);

        // Mensagens não lidas (onde o user é participante mas não remetente)
        const { data: convs } = await supabase
          .from('conversas')
          .select('id')
          .or(`participante_a.eq.${user.id},participante_b.eq.${user.id}`);
        if (convs && convs.length > 0) {
          const convIds = convs.map((c: any) => c.id);
          const { count: msgCount } = await supabase
            .from('mensagens')
            .select('*', { count: 'exact', head: true })
            .in('conversa_id', convIds)
            .neq('remetente_id', user.id)
            .is('lida_em', null);
          setUnreadMsgs(msgCount ?? 0);
        }
      }
    };
    if (!initialUser) fetchUser();
    else if (initialUser) {
      // Still fetch unread counts for logged-in users passed as props
      (async () => {
        const { data: convs } = await supabase
          .from('conversas')
          .select('id')
          .or(`participante_a.eq.${initialUser.id},participante_b.eq.${initialUser.id}`);
        if (convs && convs.length > 0) {
          const convIds = convs.map((c: any) => c.id);
          const { count: msgCount } = await supabase
            .from('mensagens')
            .select('*', { count: 'exact', head: true })
            .in('conversa_id', convIds)
            .neq('remetente_id', initialUser.id)
            .is('lida_em', null);
          setUnreadMsgs(msgCount ?? 0);
        }
      })();
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [initialUser]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <nav className="bg-white border-b border-ink-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="display text-xl tracking-tight">
            <span className="text-brand-green">Troca</span>
            <span className="text-ink-900">Cromos</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/painel" className="px-3 py-2 hover:bg-ink-100 rounded-lg">Painel</Link>
          <Link href="/painel/matches" className="px-3 py-2 hover:bg-ink-100 rounded-lg">Matches</Link>
          <Link href="/eventos" className="px-3 py-2 hover:bg-ink-100 rounded-lg">Eventos</Link>
          <Link href="/premium" className="px-3 py-2 hover:bg-ink-100 rounded-lg text-brand-green font-semibold">Premium</Link>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Link href="/conversas" className="relative p-2 hover:bg-ink-100 rounded-lg transition-colors" title="Conversas">
              <MessageCircle className="w-5 h-5 text-ink-900" />
              {unreadMsgs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-green text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                  {unreadMsgs > 9 ? '9+' : unreadMsgs}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-100"
              >
                <div className="relative">
                  <Avatar name={profile?.nome || 'U'} src={profile?.foto_url} size="sm" />
                  {notifs > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {notifs > 9 ? '9+' : notifs}
                    </span>
                  )}
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-ink-100 py-2">
                  <div className="px-4 py-2 border-b border-ink-100">
                    <div className="font-medium truncate">{profile?.nome}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    {profile?.plano && profile.plano !== 'free' && (
                      <div className="mt-1 inline-block text-xs bg-brand-yellow px-2 py-0.5 rounded-full font-semibold">
                        {profile.plano.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <Link href="/painel" className="block px-4 py-2 hover:bg-ink-100 text-sm">
                    Painel
                  </Link>
                  <Link href="/conversas" className="flex items-center gap-2 px-4 py-2 hover:bg-ink-100 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    Conversas
                    {unreadMsgs > 0 && (
                      <span className="ml-auto bg-brand-green text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                        {unreadMsgs > 9 ? '9+' : unreadMsgs}
                      </span>
                    )}
                  </Link>
                  <Link href={`/perfil/${user.id}`} className="block px-4 py-2 hover:bg-ink-100 text-sm">
                    Meu perfil
                  </Link>
                  <Link href="/configuracoes" className="block px-4 py-2 hover:bg-ink-100 text-sm">
                    Configurações
                  </Link>
                  <Link href="/painel/trocas" className="block px-4 py-2 hover:bg-ink-100 text-sm">
                    Minhas trocas
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full text-left px-4 py-2 hover:bg-ink-100 text-sm text-red-600"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Começar grátis</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
  }
