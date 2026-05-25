'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Disclaimer } from '@/components/Disclaimer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('onboarding_completo')
          .eq('id', user.id)
          .single();
        router.push(perfil?.onboarding_completo ? '/painel' : '/onboarding');
      }
    } catch (e: any) {
      setErro(e.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : (e.message || 'Erro ao entrar.'));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/painel` },
    });
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-ink-100 to-white">
        <div className="w-full max-w-md">
          <Link href="/" className="display text-3xl text-center block mb-8">
            <span className="text-brand-green">Troca</span>
            <span className="text-ink-900">Cromos</span>
          </Link>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-ink-100">
            <h1 className="display text-2xl mb-2">Bom te ver de novo</h1>
            <p className="text-sm text-gray-600 mb-6">Entre para continuar trocando.</p>

            <button
              onClick={signInWithGoogle}
              className="w-full mb-4 flex items-center justify-center gap-3 border-2 border-ink-100 rounded-xl px-4 py-2.5 hover:bg-ink-100 transition-colors"
              type="button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18a11 11 0 000 9.86l3.66-2.83z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 002.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              <span className="font-medium">Continuar com Google</span>
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
              <div className="flex-1 h-px bg-ink-100"></div>
              ou com e-mail
              <div className="flex-1 h-px bg-ink-100"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>

              <div className="text-right">
                <Link href="/recuperar-senha" className="text-sm text-brand-green hover:underline">
                  Esqueci minha senha
                </Link>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{erro}</div>
              )}

              <Button type="submit" className="w-full" loading={loading} size="lg">Entrar</Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Novo aqui? <Link href="/signup" className="text-brand-green font-medium hover:underline">Criar conta grátis</Link>
            </p>
          </div>
        </div>
      </div>
      <Disclaimer />
    </>
  );
}
