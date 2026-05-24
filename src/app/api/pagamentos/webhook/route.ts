import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json({ ok: true, demo: true });

  const paymentId = body?.data?.id || body?.id;
  if (!paymentId) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: 'mp api fail' }, { status: 502 });
    const payment = await res.json();

    const status = payment.status;
    const externalRef = payment.external_reference;
    if (!externalRef) return NextResponse.json({ ok: false, error: 'no ref' }, { status: 400 });

    const [userId, plano] = externalRef.split('::');
    const supabase = createServiceClient();

    if (status === 'approved') {
      await supabase
        .from('usuarios')
        .update({
          plano,
          plano_ate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', userId);

      await supabase
        .from('pagamentos')
        .update({ status: 'aprovado', gateway_id: String(paymentId) })
        .eq('user_id', userId)
        .eq('produto', plano)
        .eq('status', 'pendente');

      await supabase.from('notificacoes').insert({
        user_id: userId,
        tipo: 'pagamento_aprovado',
        titulo: 'Bem-vindo ao ' + plano.toUpperCase() + '! 🎉',
        conteudo: 'Seu pagamento foi aprovado e seu plano já está ativo.',
      });
    } else if (status === 'rejected') {
      await supabase
        .from('pagamentos')
        .update({ status: 'recusado' })
        .eq('user_id', userId)
        .eq('produto', plano)
        .eq('status', 'pendente');
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('webhook error', e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
