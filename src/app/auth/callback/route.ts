import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
      const next = searchParams.get('next') ?? null;

        if (code) {
            const supabase = createClient();
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (!error) {
                          // Se veio um next explicito (ex: ?next=/onboarding), respeitar
                                if (next) {
                                        return NextResponse.redirect(`${origin}${next}`);
                                              }

                                                    // Verificar se usuario ja completou onboarding
                                                          const { data: { user } } = await supabase.auth.getUser();
                                                                if (user) {
                                                                        const { data: perfil } = await supabase
                                                                                  .from('usuarios')
                                                                                            .select('onboarding_completo')
                                                                                                      .eq('id', user.id)
                                                                                                                .single();

                                                                                                                        if (perfil?.onboarding_completo) {
                                                                                                                                  return NextResponse.redirect(`${origin}/painel`);
                                                                                                                                          } else {
                                                                                                                                                    return NextResponse.redirect(`${origin}/onboarding`);
                                                                                                                                                            }
                                                                                                                                                                  }

                                                                                                                                                                        return NextResponse.redirect(`${origin}/onboarding`);
                                                                                                                                                                            }
                                                                                                                                                                              }

                                                                                                                                                                                // Redireciona para pagina de erro em caso de falha
                                                                                                                                                                                  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
                                                                                                                                                                                  }