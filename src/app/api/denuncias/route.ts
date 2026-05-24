import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const Schema = z.object({
  denunciado_id: z.string().uuid(),
  motivo: z.string().min(3).max(120),
  detalhes: z.string().max(2000).optional(),
  acordo_id: z.string().uuid().optional(),
  evidencias: z.any().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase.from('denuncias').insert({
    denunciante_id: user.id,
    denunciado_id: parsed.data.denunciado_id,
    motivo: parsed.data.motivo,
    detalhes: parsed.data.detalhes,
    acordo_id: parsed.data.acordo_id,
    evidencias: parsed.data.evidencias,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ denuncia: data });
}
