import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card, Avatar, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function unslugify(slug: string) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default async function CidadePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const nomeCidade = unslugify(params.slug);

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('id,nome,foto_url,bairro,estado,reputacao,trocas_concluidas,verificado,plano')
    .ilike('cidade', nomeCidade)
    .eq('banido', false)
    .order('reputacao', { ascending: false })
    .limit(50);

  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="display text-3xl md:text-4xl mb-2">Colecionadores em {nomeCidade}</h1>
        <p className="text-gray-600 mb-6">
          {usuarios?.length ?? 0} colecionadores cadastrados em {nomeCidade}.
          Encontre quem está perto e tem o que você precisa.
        </p>

        {(!usuarios || usuarios.length === 0) ? (
          <Card>
            <div className="text-center py-12">
              <h2 className="display text-xl mb-3">Seja o primeiro de {nomeCidade}!</h2>
              <p className="text-gray-600 mb-4">Cadastre-se grátis e comece a montar a comunidade local.</p>
              <Link href="/signup">
                <Button>Criar conta grátis</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {usuarios.map((u) => (
              <Link key={u.id} href={`/perfil/${u.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.nome} src={u.foto_url} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold truncate">{u.nome}</div>
                        {u.verificado && <Badge variant="green">✓</Badge>}
                        {u.plano === 'premium' && <Badge variant="yellow">P</Badge>}
                      </div>
                      <div className="text-xs text-gray-500">{u.bairro && `${u.bairro} · `}{u.estado}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ⭐ {u.reputacao?.toFixed(1) || '—'} · {u.trocas_concluidas} trocas
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Disclaimer />
    </>
  );
}
