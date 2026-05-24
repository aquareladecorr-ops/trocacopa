import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card } from '@/components/ui/Card';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!perfil?.is_admin) {
    redirect('/painel');
  }

  const [
    { count: totalUsuarios },
    { count: usuariosPremium },
    { count: trocasConcluidas },
    { count: propostasAtivas },
    { count: denunciasAbertas },
    { data: denuncias },
  ] = await Promise.all([
    supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).in('plano', ['premium', 'plus']),
    supabase.from('acordos_troca').select('*', { count: 'exact', head: true }).eq('status', 'concluido'),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('denuncias').select('*', { count: 'exact', head: true }).eq('status', 'aberta'),
    supabase
      .from('denuncias')
      .select(`
        id,motivo,detalhes,status,criado_em,
        denunciante:denunciante_id(nome),
        denunciado:denunciado_id(nome,email)
      `)
      .eq('status', 'aberta')
      .limit(10),
  ]);

  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="display text-3xl mb-6">Admin</h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <Card>
            <div className="text-xs uppercase text-gray-500">Usuários</div>
            <div className="display text-3xl mt-1">{totalUsuarios ?? 0}</div>
          </Card>
          <Card>
            <div className="text-xs uppercase text-gray-500">Pagantes</div>
            <div className="display text-3xl mt-1 text-brand-green">{usuariosPremium ?? 0}</div>
          </Card>
          <Card>
            <div className="text-xs uppercase text-gray-500">Trocas</div>
            <div className="display text-3xl mt-1">{trocasConcluidas ?? 0}</div>
          </Card>
          <Card>
            <div className="text-xs uppercase text-gray-500">Propostas</div>
            <div className="display text-3xl mt-1 text-yellow-700">{propostasAtivas ?? 0}</div>
          </Card>
          <Card>
            <div className="text-xs uppercase text-gray-500">Denúncias</div>
            <div className="display text-3xl mt-1 text-red-600">{denunciasAbertas ?? 0}</div>
          </Card>
        </div>

        <h2 className="display text-xl mb-3">Denúncias abertas</h2>
        {(!denuncias || denuncias.length === 0) ? (
          <Card><div className="text-center py-8 text-gray-500">Nenhuma denúncia aberta. 🎉</div></Card>
        ) : (
          <div className="space-y-3">
            {denuncias.map((d: any) => (
              <Card key={d.id}>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold">{d.motivo}</div>
                  <span className="text-xs text-gray-500">{new Date(d.criado_em).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{d.detalhes}</p>
                <div className="text-xs text-gray-500">
                  Por <strong>{d.denunciante?.nome}</strong> sobre <strong>{d.denunciado?.nome}</strong> ({d.denunciado?.email})
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Disclaimer />
    </>
  );
}
