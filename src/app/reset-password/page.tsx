'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase redireciona com tokens no hash da URL
    // O cliente do Supabase processa automaticamente o hash
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })

    if (error) {
      setErro('Erro ao redefinir senha. O link pode ter expirado. Solicite um novo.')
    } else {
      setSucesso(true)
      setTimeout(() => router.push('/painel'), 3000)
    }
    setLoading(false)
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Senha redefinida!</h1>
          <p className="text-gray-600 mb-4">
            Sua senha foi alterada com sucesso. Redirecionando...
          </p>
          <Link href="/painel" className="text-green-600 hover:underline text-sm">
            Ir para o painel agora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="mb-8 text-2xl font-bold">
        <span className="text-gray-900">Troca</span>
        <span className="text-green-600">Cromos</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Redefinir senha</h1>
        <p className="text-sm text-gray-600 mb-6">
          Digite sua nova senha abaixo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              placeholder="Repita a nova senha"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {erro && (
            <p className="text-red-500 text-sm">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-xl px-4 py-2.5 font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-green-600 hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}
