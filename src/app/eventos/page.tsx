import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function EventosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: eventos } = await supabase
    .from('eventos')
    .select('*')
    .gte('data_inicio', new Date().toISOString())
    .order('data_inicio')
    .limit(30);

  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="display text-3xl">Eventos de troca</h1>
            <p className="text-gray-600 text-sm">Encontros presenciais em cidades de todo o Brasil.</p>
          </div>
          {user && (
            <Button variant="secondary">+ Criar evento</Button>
          )}
        </div>

        {(!eventos || eventos.length === 0) ? (
          <Card>
            <div className="text-center py-12">
              <div className="display text-3xl mb-2">📅</div>
              <h2 className="display text-xl mb-2">Sem eventos no momento</h2>
              <p className="text-gray-600 mb-4">Que tal organizar o primeiro encontro da sua cidade?</p>
              {user ? (
                <Button>Criar evento</Button>
              ) : (
                <Link href="/signup"><Button>Criar conta grátis</Button></Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {eventos.map((e: any) => (
              <Card key={e.id} className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs uppercase text-gray-500">
                    {e.cidade}, {e.estado}
                  </div>
                  {e.patrocinado && <Badge variant="yellow">Patrocinado</Badge>}
                </div>
                <h3 className="display text-lg mb-2">{e.titulo}</h3>
                <p className="text-sm text-gray-700 line-clamp-3 mb-3">{e.descricao}</p>
                <div className="text-sm text-gray-600 mb-3">
                  <div>📍 {e.local}</div>
                  <div>📅 {new Date(e.data_inicio).toLocaleString('pt-BR')}</div>
                </div>
                <Button variant="secondary" size="sm">Vou participar</Button>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Disclaimer />
    </>
  );
}
