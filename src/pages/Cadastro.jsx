import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Mail, Lock, User, CreditCard, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { supabase } from '../lib/supabaseClient.js'

// Traduz o erro real do Supabase. Nunca inventa "já cadastrado":
// só diz isso quando o servidor de fato reportou duplicidade.
function mensagemDeErro(err) {
  const code = err?.code
  const status = err?.status
  const msg = (err?.message || '').toLowerCase()

  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered')) {
    return 'Esse e-mail já tem uma conta. Tente fazer login.'
  }
  if (code === '23505') {
    return msg.includes('cpf')
      ? 'Esse CPF já está cadastrado.'
      : 'Esses dados já estão cadastrados.'
  }
  if (code === 'signup_disabled') {
    return 'O cadastro está desativado no servidor. Habilite "Allow new users to sign up" no painel do Supabase (Authentication → Sign In / Providers).'
  }
  if (code === 'weak_password' || msg.includes('password should be')) {
    return 'Senha muito fraca. Use pelo menos 6 caracteres.'
  }
  if (code === 'validation_failed' || msg.includes('invalid email')) {
    return 'E-mail inválido. Confira o endereço digitado.'
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || status === 429) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.'
  }
  if (code === '42501' || code === '42P01') {
    return 'Conta criada, mas o banco recusou salvar o perfil (permissão/tabela). Avise o administrador.'
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror')) {
    return 'Não foi possível falar com o servidor. Verifique sua conexão.'
  }
  return `Não foi possível criar a conta: ${err?.message || 'erro desconhecido'}`
}

export default function Cadastro() {
  const [tipo, setTipo] = useState('cliente')
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const { dark, alternarTema } = useTheme()
  const navigate = useNavigate()

  function formatCpf(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  // O trigger do banco deve criar a linha em "profiles" com nome/e-mail/tipo, e
  // aqui completamos o CPF. Se o trigger não existir, criamos a linha inteira.
  async function salvarPerfil(userId, cpfDigits) {
    const { data: atualizados, error: updateError } = await supabase
      .from('profiles')
      .update({ cpf: cpfDigits })
      .eq('id', userId)
      .select('id')

    if (updateError) throw updateError
    if (atualizados?.length) return

    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      nome_completo: nomeCompleto.trim(),
      email: email.trim(),
      cpf: cpfDigits,
      tipo,
    })

    if (insertError) {
      // Duplicidade que não é de CPF significa que a linha já existia (o update
      // acima funcionou, mas a política de RLS não deixa ler de volta).
      const detalhe = `${insertError.message} ${insertError.details || ''}`.toLowerCase()
      const linhaJaExistia = insertError.code === '23505' && !detalhe.includes('cpf')
      if (!linhaJaExistia) throw insertError
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    const cpfDigits = cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      setError('Digite um CPF válido (11 números).')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const data = await signUp(email, password, nomeCompleto, tipo)

      // Sem sessão = o projeto exige confirmação de e-mail. Ainda não é possível
      // gravar o perfil (RLS) nem abrir o painel.
      if (!data?.session) {
        setInfo('Conta criada! Confirme o e-mail que enviamos e depois faça login.')
        return
      }

      await salvarPerfil(data.user.id, cpfDigits)
      navigate('/dashboard')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(mensagemDeErro(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-8 sm:p-10 relative">
        <button
          type="button"
          onClick={alternarTema}
          className="absolute top-5 right-5 z-10 p-2 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
            <Home className="text-white" size={24} />
          </div>
          <div>
            <p className="text-lg leading-tight text-gray-900 dark:text-white font-semibold">
              Doméstica
              <br />
              <span className="text-emerald-500">A Caminho</span>
            </p>
          </div>
        </div>

        <h1 className="text-2xl text-gray-900 dark:text-white mb-1 font-semibold">Criar conta</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Preencha os dados para começar.</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setTipo('cliente')}
            className={`py-3 rounded-lg border font-medium transition-colors ${
              tipo === 'cliente'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            Sou cliente
          </button>
          <button
            type="button"
            onClick={() => setTipo('profissional')}
            className={`py-3 rounded-lg border font-medium transition-colors ${
              tipo === 'profissional'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            Sou profissional
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Nome completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Seu nome"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">CPF</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg px-3 py-2">
              {info}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Criar conta
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Já tem uma conta?{' '}
          <Link to="/" className="text-emerald-500 hover:text-emerald-600 font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}