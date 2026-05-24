import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const Schema = z.object({
  action: z.enum(['aceitar', 'rejeitar', 'cancelar', 'contraproposta']),
  contraproposta: z.object({
    oferta: z.array(z.any()),
    pedido: z.array(z.any()),
    mensagem: z.string().optional(),
  }).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: proposta, error: e1 } = await supabase
    .from('propostas')
    .select('*')
    .eq('id', params.id)
    .single();
  if (e1 || !proposta) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });

  const isDest = proposta.destinatario_id === user.id;
  const isRem = proposta.remetente_id === user.id;
  if (!isDest && !isRem) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  const a = parsed.data.action;
  let novoStatus = proposta.status;
  if (a === 'aceitar' && isDest) novoStatus = 'aceita';
  else if (a === 'rejeitar' && isDest) novoStatus = 'rejeitada';
  else if (a === 'cancelar' && isRem) novoStatus = 'cancelada';
  else if (a === 'contraproposta' && isDest) novoStatus = 'contraproposta';
  else return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });

  await supabase.from('propostas').update({ status: novoStatus }).eq('id', params.id);

  if (novoStatus === 'aceita') {
    await supabase.from('acordos_troca').insert({
      proposta_id: proposta.id,
      user_a: proposta.remetente_id,
      user_b: proposta.destinatario_id,
      itens_a_para_b: proposta.oferta,
      itens_b_para_a: proposta.pedido,
      forma_troca: proposta.forma_troca,
      status: 'aceito',
    });
  }

  return NextResponse.json({ ok: true, status: novoStatus });
}
