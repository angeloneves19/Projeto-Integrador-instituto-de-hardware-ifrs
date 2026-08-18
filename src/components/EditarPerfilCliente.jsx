import { useEffect, useState } from 'react'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function EditarPerfilCliente() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)

  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')

  useEffect(() => {
    carregar()
  }, [session?.user?.id])

  async function carregar() {
    if (!session?.user?.id) return
    setLoading(true)

    const { data, error } = await supabase
      .from('profiles')
      .select('telefone, endereco, cidade')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Erro ao buscar perfil:', error)
      setErro('Não foi possível carregar seus dados.')
    } else {
      setTelefone(data?.telefone || '')
      setEndereco(data?.endereco || '')
      setCidade(data?.cidade || '')
    }
    setLoading(false)
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setErro('')
    setSalvo(false)
    setSalvando(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        telefone: telefone.trim() || null,
        endereco: endereco.trim() || null,
        cidade: cidade.trim() || null,
      })
      .eq('id', session.user.id)

    if (error) {
      console.error('Erro ao salvar perfil:', error)
      setErro('Não foi possível salvar suas alterações. Tente novamente.')
    } else {
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    }
    setSalvando(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSalvar} className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-4">
      <div>
        <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Telefone</label>
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(51) 99999-9999"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Cidade</label>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Ex: Porto Alegre"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Endereço</label>
        <textarea
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          rows={2}
          placeholder="Rua, número, bairro, complemento..."
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Visível apenas para profissionais com quem você já entrou em contato.
        </p>
      </div>

      {erro && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 font-medium transition-colors disabled:opacity-70"
      >
        {salvando ? <Loader2 className="animate-spin" size={18} /> : salvo ? <CheckCircle2 size={18} /> : <Save size={18} />}
        {salvo ? 'Salvo!' : 'Salvar alterações'}
      </button>
    </form>
  )
}