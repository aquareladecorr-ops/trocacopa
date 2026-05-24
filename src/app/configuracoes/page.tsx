'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Disclaimer } from '@/components/Disclaimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Label } from '@/components/ui/Input';

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);
      const { data } = await supabase.from('usuarios').select('*').eq('id', u.id).single();
      setPerfil(data);
      setLoading(false);
    })();
  }, [router]);

  async function salvar() {
    if (!user) return;
    setSaving(true); setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from('usuarios')
      .update({
        nome: perfil.nome,
        cidade: perfil.cidade,
        bairro: perfil.bairro,
        estado: perfil.estado,
        whatsapp: perfil.whatsapp,
        whatsapp_oculto: perfil.whatsapp_oculto,
        instagram: perfil.instagram,
        bio: perfil.bio,
        forma_troca: perfil.forma_troca,
        contato_preferido: perfil.contato_preferido,
      })
      .eq('id', user.id);
    setSaving(false);
    setMsg(error ? 'Erro: ' + error.message : 'Salvo com sucesso ✓');
  }

  if (loading) return null;

  return (
    <>
      <Navbar initialUser={user} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="display text-3xl mb-5">Configurações</h1>

        <Card className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={perfil?.nome || ''} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea value={perfil?.bio || ''} rows={3} onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })} placeholder="Conte um pouco sobre você e o que coleciona…" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label>Cidade</Label>
              <Input value={perfil?.cidade || ''} onChange={(e) => setPerfil({ ...perfil, cidade: e.target.value })} />
            </div>
            <div>
              <Label>UF</Label>
              <Select value={perfil?.estado || 'SP'} onChange={(e) => setPerfil({ ...perfil, estado: e.target.value })}>
                {ESTADOS.map((uf) => <option key={uf}>{uf}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label>Bairro</Label>
            <Input value={perfil?.bairro || ''} onChange={(e) => setPerfil({ ...perfil, bairro: e.target.value })} />
          </div>

          <div>
            <Label>WhatsApp</Label>
            <Input value={perfil?.whatsapp || ''} onChange={(e) => setPerfil({ ...perfil, whatsapp: e.target.value })} placeholder="(11) 99999-9999" />
            <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
              <input type="checkbox" checked={perfil?.whatsapp_oculto ?? true} onChange={(e) => setPerfil({ ...perfil, whatsapp_oculto: e.target.checked })} />
              Ocultar WhatsApp publicamente
            </label>
          </div>

          <div>
            <Label>Instagram (opcional)</Label>
            <Input value={perfil?.instagram || ''} onChange={(e) => setPerfil({ ...perfil, instagram: e.target.value })} placeholder="@seuusuario" />
          </div>

          <div>
            <Label>Forma de troca preferida</Label>
            <Select value={perfil?.forma_troca || 'ambos'} onChange={(e) => setPerfil({ ...perfil, forma_troca: e.target.value })}>
              <option value="presencial">Apenas presencial</option>
              <option value="envio">Apenas por envio</option>
              <option value="ambos">Ambos</option>
            </Select>
          </div>

          <div>
            <Label>Contato preferido</Label>
            <Select value={perfil?.contato_preferido || 'chat_interno'} onChange={(e) => setPerfil({ ...perfil, contato_preferido: e.target.value })}>
              <option value="chat_interno">Chat interno</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">E-mail</option>
            </Select>
          </div>

          {msg && (
            <div className={`rounded-lg p-3 text-sm ${msg.startsWith('Erro') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {msg}
            </div>
          )}

          <Button onClick={salvar} loading={saving} className="w-full">Salvar alterações</Button>
        </Card>
      </main>
      <Disclaimer />
    </>
  );
}
