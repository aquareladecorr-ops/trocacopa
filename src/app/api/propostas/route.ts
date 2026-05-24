import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const Schema = z.object({
  destinatario_id: z.string().uuid(),
  colecao_id: z.string().uuid().optional(),
  oferta: z.array(z.object({ figurinha_id: z.string().uuid(), qtd: z.number().int().positive() })),
  pedido: z.array(z.object({ figurinha_id: z.string().uuid(), qtd: z.number().int().positive() })),
  mensagem: z.string().max(500).optional(),
  forma_troca: z.enum(['presencial','envio','ambos']).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase
    .from('propostas')
    .insert({
      remetente_id: user.id,
      destinatario_id: parsed.data.destinatario_id,
      colecao_id: parsed.data.colecao_id,
      oferta: parsed.data.oferta,
      pedido: parsed.data.pedido,
      mensagem: parsed.data.mensagem,
      forma_troca: parsed.data.forma_troca,
      status: 'pendente',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ proposta: data });
}
