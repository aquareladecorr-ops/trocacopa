'use client';
          // Re-fetch count when messages are marked as read
          await fetchUnreadCount(u);
        })
        .subscribe();
    };

    const fetchUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) await init(u);
    };

    if (initialUser) {
      init(initialUser);
    } else {
      fetchUser();
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        init(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setUnreadMsgs(0);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
      if (channel) channel.unsubscribe();
    };
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
            <span className="text-ink-900">Copa</span>
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
