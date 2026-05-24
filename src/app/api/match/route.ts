import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const colecaoId = searchParams.get('colecao_id');
  const limit = Number(searchParams.get('limit') || 50);
  const cidadeOnly = searchParams.get('cidade_only') === 'true';

  if (!colecaoId) return NextResponse.json({ error: 'Falta colecao_id' }, { status: 400 });

  const { data, error } = await supabase.rpc('buscar_matches', {
    p_user_id: user.id,
    p_colecao_id: colecaoId,
    p_limite: limit,
    p_mesma_cidade_only: cidadeOnly,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ matches: data });
}
