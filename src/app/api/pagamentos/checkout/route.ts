import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PRECOS: Record<string, { nome: string; valor: number }> = {
  premium: { nome: 'Premium TrocaCromos', valor: 9.9 },
  plus:    { nome: 'Plus TrocaCromos',    valor: 19.9 },
};

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const form = await req.formData();
  const plano = String(form.get('plano') || '').toLowerCase();
  const config = PRECOS[plano];
  if (!config) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    // Modo demo: registra pagamento como pendente
    await supabase.from('pagamentos').insert({
      user_id: user.id,
      produto: plano,
      valor: config.valor,
      status: 'pendente',
      gateway: 'mercadopago_demo',
    });
    return NextResponse.redirect(new URL(`/premium?demo=1&plano=${plano}`, req.url));
  }

  // Integração real
  try {
    const { MercadoPagoConfig, Preference } = await import('mercadopago');
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const pref = await preference.create({
      body: {
        items: [{
          id: plano,
          title: config.nome,
          quantity: 1,
          unit_price: config.valor,
          currency_id: 'BRL',
        }],
        payer: { email: user.email! },
        back_urls: {
          success: `${baseUrl}/premium?status=success`,
          failure: `${baseUrl}/premium?status=failure`,
          pending: `${baseUrl}/premium?status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/pagamentos/webhook`,
        external_reference: `${user.id}::${plano}`,
      },
    });

    await supabase.from('pagamentos').insert({
      user_id: user.id,
      produto: plano,
      valor: config.valor,
      status: 'pendente',
      gateway: 'mercadopago',
      gateway_id: pref.id,
    });

    return NextResponse.redirect(pref.init_point!, 303);
  } catch (e: any) {
    console.error('MP error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
