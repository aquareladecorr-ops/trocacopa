'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setErro('Erro ao enviar e-mail. Verifique o endereço e tente novamente.')
    } else {
      setEnviado(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="mb-8 text-2xl font-bold">
        <span className="text-gray-900">Troca</span>
        <span className="text-green-600">Cromos</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 w-full max-w-md">
        {enviado ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2">E-mail enviado!</h1>
            <p className="text-gray-600 mb-6">
              Enviamos um link de recuperação para <strong>{email}</strong>.
              Verifique sua caixa de entrada (e o spam).
            </p>
            <Link
              href="/login"
              className="text-green-600 hover:underline text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Recuperar senha</h1>
            <p className="text-sm text-gray-600 mb-6">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
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
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Lembrou a senha?{' '}
              <Link href="/login" className="text-green-600 hover:underline">
                Fazer login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
