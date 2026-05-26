import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLANO = {
    id: 'premium',
    nome: 'Premium TrocaCopa',
    valor: 29.9,
};

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
          return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });
    }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.trocacopa.com';

  if (!accessToken) {
        return NextResponse.json({ error: 'MP nao configurado' }, { status: 500 });
  }

  try {
        const body = {
                transaction_amount: PLANO.valor,
                description: PLANO.nome,
                payment_method_id: 'pix',
                payer: {
                          email: user.email,
                },
                external_reference: `${user.id}::${PLANO.id}`,
                notification_url: `${baseUrl}/api/pagamentos/webhook`,
                date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // expira em 30 min
        };

      const res = await fetch('https://api.mercadopago.com/v1/payments', {
              method: 'POST',
              headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Idempotency-Key': `pix-${user.id}-${Date.now()}`,
              },
              body: JSON.stringify(body),
      });

      if (!res.ok) {
              const err = await res.json();
              console.error('MP Pix error:', err);
              return NextResponse.json({ error: 'Erro ao gerar Pix', detail: err }, { status: 500 });
      }

      const data = await res.json();

      // Registra pagamento pendente no banco
      await supabase.from('pagamentos').insert({
              user_id: user.id,
              produto: PLANO.id,
              valor: PLANO.valor,
              status: 'pendente',
              gateway: 'mercadopago_pix',
              gateway_id: String(data.id),
      });

      // Retorna QR code para exibir na tela
      return NextResponse.json({
              payment_id: data.id,
              qr_code: data.point_of_interaction?.transaction_data?.qr_code,
              qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
              ticket_url: data.point_of_interaction?.transaction_data?.ticket_url,
              expires_at: body.date_of_expiration,
      });
  } catch (e: any) {
        console.error('Checkout Pix error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
