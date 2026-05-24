import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

async function checkAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401 };
  const { data: perfil } = await supabase.from('usuarios').select('is_admin').eq('id', user.id).single();
  if (!perfil?.is_admin) return { ok: false as const, status: 403 };
  return { ok: true as const, user };
}

export async function GET(req: NextRequest) {
  const check = await checkAdmin();
  if (!check.ok) return NextResponse.json({ error: 'forbidden' }, { status: check.status });

  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const supabase = createServiceClient();

  let query = supabase
    .from('usuarios')
    .select('id,nome,email,cidade,estado,plano,reputacao,trocas_concluidas,banido,is_admin,criado_em')
    .order('criado_em', { ascending: false })
    .limit(100);

  if (q) query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%,cidade.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ usuarios: data });
}

export async function PATCH(req: NextRequest) {
  const check = await checkAdmin();
  if (!check.ok) return NextResponse.json({ error: 'forbidden' }, { status: check.status });

  const { user_id, banido, banido_motivo, is_admin } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'falta user_id' }, { status: 400 });

  const supabase = createServiceClient();
  const updates: Record<string, any> = {};
  if (banido !== undefined) { updates.banido = banido; updates.banido_motivo = banido_motivo ?? null; }
  if (is_admin !== undefined) updates.is_admin = is_admin;

  const { error } = await supabase.from('usuarios').update(updates).eq('id', user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
