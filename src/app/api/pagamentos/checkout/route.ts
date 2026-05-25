import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Plano unico: Premium R$29,90/mes com cobranca automatica
const PLANO = {
  id: 'premium',
    nome: 'Premium TrocaCopa',
      valor: 29.9,
      };

      export async function POST(req: NextRequest) {
        const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return NextResponse.redirect(new URL('/login', req.url));
                  }

                    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
                      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.trocacopa.com';

                        if (!accessToken) {
                            // Modo demo: registra como pendente
                                await supabase.from('pagamentos').insert({
                                      user_id: user.id,
                                            produto: PLANO.id,
                                                  valor: PLANO.valor,
                                                        status: 'pendente',
                                                              gateway: 'mercadopago_demo',
                                                                  });
                                                                      return NextResponse.redirect(new URL('/premium?demo=1', req.url));
                                                                        }

                                                                          // Criacao de assinatura recorrente via API Preapproval do Mercado Pago
                                                                            try {
                                                                                const body = {
                                                                                      reason: PLANO.nome,
                                                                                            auto_recurring: {
                                                                                                    frequency: 1,
                                                                                                            frequency_type: 'months',
                                                                                                                    transaction_amount: PLANO.valor,
                                                                                                                            currency_id: 'BRL',
                                                                                                                                  },
                                                                                                                                        payer_email: user.email,
                                                                                                                                              back_url: `${baseUrl}/premium?status=success`,
                                                                                                                                                    external_reference: `${user.id}::${PLANO.id}`,
                                                                                                                                                          notification_url: `${baseUrl}/api/pagamentos/webhook`,
                                                                                                                                                              };

                                                                                                                                                                  const res = await fetch('https://api.mercadopago.com/preapproval', {
                                                                                                                                                                        method: 'POST',
                                                                                                                                                                              headers: {
                                                                                                                                                                                      Authorization: `Bearer ${accessToken}`,
                                                                                                                                                                                              'Content-Type': 'application/json',
                                                                                                                                                                                                    },
                                                                                                                                                                                                          body: JSON.stringify(body),
                                                                                                                                                                                                              });

                                                                                                                                                                                                                  if (!res.ok) {
                                                                                                                                                                                                                        const err = await res.json();
                                                                                                                                                                                                                              console.error('MP Preapproval error:', err);
                                                                                                                                                                                                                                    return NextResponse.json({ error: 'Erro ao criar assinatura' }, { status: 500 });
                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                            const data = await res.json();

                                                                                                                                                                                                                                                // Registra assinatura pendente no banco
                                                                                                                                                                                                                                                    await supabase.from('pagamentos').insert({
                                                                                                                                                                                                                                                          user_id: user.id,
                                                                                                                                                                                                                                                                produto: PLANO.id,
                                                                                                                                                                                                                                                                      valor: PLANO.valor,
                                                                                                                                                                                                                                                                            status: 'pendente',
                                                                                                                                                                                                                                                                                  gateway: 'mercadopago',
                                                                                                                                                                                                                                                                                        gateway_id: data.id,
                                                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                                                                // Salva o ID da assinatura no perfil do usuario
                                                                                                                                                                                                                                                                                                    await supabase.from('usuarios').update({
                                                                                                                                                                                                                                                                                                          mp_subscription_id: data.id,
                                                                                                                                                                                                                                                                                                              }).eq('id', user.id);

                                                                                                                                                                                                                                                                                                                  // Redireciona para a pagina de pagamento do MP
                                                                                                                                                                                                                                                                                                                      return NextResponse.redirect(data.init_point, 303);
                                                                                                                                                                                                                                                                                                                        } catch (e: any) {
                                                                                                                                                                                                                                                                                                                            console.error('Checkout error:', e);
                                                                                                                                                                                                                                                                                                                                return NextResponse.json({ error: e.message }, { status: 500 });
                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                  }