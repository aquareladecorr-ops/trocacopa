import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const paymentId = new URL(req.url).searchParams.get('payment_id');
  if (!paymentId) return NextResponse.json({ error: 'payment_id obrigatorio' }, { status: 400 });

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json({ status: 'pending' });

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ status: 'pending' });

    const data = await res.json();
    const status = data.status;

    // Se aprovado, ativa o Premium no banco imediatamente
    if (status === 'approved') {
      const externalRef = data.external_reference; // formato: "userId::plano"
      if (externalRef) {
        const [userId, plano] = externalRef.split('::');
        if (userId && plano) {
          const supabase = createServiceClient();

          // Ativa Premium por 30 dias
          await supabase
            .from('usuarios')
            .update({
              plano,
              plano_ate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', userId);

          // Atualiza registro de pagamento para aprovado
          await supabase
            .from('pagamentos')
            .update({ status: 'aprovado' })
            .eq('gateway_id', paymentId)
            .eq('user_id', userId);
        }
      }
    }

    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ status: 'pending' });
  }
}
