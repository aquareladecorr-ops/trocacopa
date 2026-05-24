import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkAntiFraud } from '@/lib/antifraude';

const Schema = z.object({
  conversa_id: z.string().uuid(),
  conteudo: z.string().min(1).max(2000),
  tipo: z.enum(['texto', 'imagem']).default('texto'),
  anexo_url: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const fraud = checkAntiFraud(parsed.data.conteudo);

  const { data, error } = await supabase
    .from('mensagens')
    .insert({
      conversa_id: parsed.data.conversa_id,
      remetente_id: user.id,
      conteudo: parsed.data.conteudo,
      tipo: parsed.data.tipo,
      anexo_url: parsed.data.anexo_url,
      flagged_antifraude: fraud.flagged,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    mensagem: data,
    antifraude: fraud.flagged ? { warning: fraud.warningMessage } : null,
  });
}
