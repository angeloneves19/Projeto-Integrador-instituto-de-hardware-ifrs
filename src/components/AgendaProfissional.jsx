import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, User, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function formatarHora(dataISO) {
  return new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function AgendaProfissional() {
  const { session } = useAuth()
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date()
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  })
  const [compromissos, setCompromissos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().toDateString())

  useEffect(() => {
    carregar()
  }, [session?.user?.id, mesAtual])

  async function carregar() {
    if (!session?.user?.id) return
    setLoading(true)
    setErro('')

    const { data: perfilProf, error: erroPerfil } = await supabase
      .from('perfis_profissionais')
      .select('id')
      .eq('profile_id', session.user.id)
      .single()

    if (erroPerfil || !perfilProf) {
      console.error('Erro ao buscar perfil profissional:', erroPerfil)
      setErro('Não foi possível carregar sua agenda.')
      setLoading(false)
      return
    }

    const inicioMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).toISOString()
    const fimMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1).toISOString()

    const { data, error } = await supabase
      .from('agenda_profissional')
      .select('*, contato:contatos(mensagem, cliente:profiles!contatos_cliente_id_fkey(nome_completo))')
      .eq('profissional_id', perfilProf.id)
      .gte('data_inicio', inicioMes)
      .lt('data_inicio', fimMes)
      .order('data_inicio', { ascending: true })

    if (error) {
      console.error('Erro ao buscar agenda:', error)
      setErro('Não foi possível carregar sua agenda.')
    } else {
      setCompromissos(data || [])
    }
    setLoading(false)
  }

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()

  const diasComCompromisso = new Set(
    compromissos.map((c) => new Date(c.data_inicio).toDateString())
  )

  const celulas = []
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null)
  for (let dia = 1; dia <= totalDias; dia++) celulas.push(new Date(ano, mes, dia))

  const compromissosDoDia = compromissos.filter(
    (c) => new Date(c.data_inicio).toDateString() === diaSelecionado
  )

  function mudarMes(delta) {
    setMesAtual(new Date(ano, mes + delta, 1))
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => mudarMes(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-medium text-gray-900 dark:text-white">
          {MESES[mes]} {ano}
        </span>
        <button
          onClick={() => mudarMes(1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-emerald-500" size={22} />
        </div>
      ) : erro ? (
        <p className="text-red-500 text-sm">{erro}</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS_SEMANA.map((d, i) => (
              <div key={i} className="text-center text-xs text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-5">
            {celulas.map((data, i) => {
              if (!data) return <div key={i} />
              const chave = data.toDateString()
              const temCompromisso = diasComCompromisso.has(chave)
              const selecionado = chave === diaSelecionado
              const hoje = chave === new Date().toDateString()

              return (
                <button
                  key={i}
                  onClick={() => setDiaSelecionado(chave)}
                  className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    selecionado
                      ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-neutral-900 font-medium'
                      : hoje
                      ? 'border border-emerald-500 text-gray-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {data.getDate()}
                  {temCompromisso && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        selecionado ? 'bg-white dark:bg-neutral-900' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="border-t border-gray-100 dark:border-neutral-800 pt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {new Date(diaSelecionado).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            {compromissosDoDia.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum compromisso nesse dia.</p>
            ) : (
              <div className="space-y-2">
                {compromissosDoDia.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-gray-100 dark:border-neutral-800 px-4 py-3"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white mb-1">
                      <Clock size={14} className="text-emerald-500" />
                      {formatarHora(c.data_inicio)} às {formatarHora(c.data_fim)}
                    </div>
                    {c.contato?.cliente?.nome_completo && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                        <User size={14} className="text-gray-400" />
                        {c.contato.cliente.nome_completo}
                      </div>
                    )}
                    {c.observacao && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{c.observacao}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}