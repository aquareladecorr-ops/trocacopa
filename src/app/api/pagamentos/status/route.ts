import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
    const paymentId = new URL(req.url).searchParams.get('payment_id');
    if (!paymentId) return NextResponse.json({ error: 'payment_id obrigatorio' }, { status: 400 });
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) return NextResponse.json({ status: 'pending' });
    try {
          const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                  headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store',
          });
          if (!res.ok) return NextResponse.json({ status: 'pending' });
          const data = await res.json();
          return NextResponse.json({ status: data.status });
    } catch { return NextResponse.json({ status: 'pending' }); }
}
