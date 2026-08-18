import { useEffect, useState } from 'react'
import { Loader2, User, Calendar, Clock, Check, X, MessageSquare, CheckCheck } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import ChatContato from './ChatContato.jsx'

const TURNO_LABEL = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }
const TURNO_HORARIO = {
  manha: { inicio: '08:00', fim: '12:00' },
  tarde: { inicio: '13:00', fim: '17:00' },
  noite: { inicio: '18:00', fim: '21:00' },
}

function extrairHorario(turno) {
  if (!turno) return null
  const match = turno.match(/^(\d{2}:\d{2})\s*às\s*(\d{2}:\d{2})$/)
  if (match) return { inicio: match[1], fim: match[2] }
  return TURNO_HORARIO[turno] || null
}

export default function PainelContatos() {
  const { session } = useAuth()
  const [perfilProfId, setPerfilProfId] = useState(null)
  const [contatos, setContatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [processando, setProcessando] = useState(null)
  const [avisoConflito, setAvisoConflito] = useState('')
  const [chatAberto, setChatAberto] = useState(null)

  useEffect(() => {
    carregar()
  }, [session?.user?.id])

  async function carregar() {
    setLoading(true)
    setErro('')

    const { data: perfilProf, error: erroPerfil } = await supabase
      .from('perfis_profissionais')
      .select('id')
      .eq('profile_id', session.user.id)
      .single()

    if (erroPerfil || !perfilProf) {
      console.error('Erro ao buscar perfil profissional:', erroPerfil)
      setErro('Não foi possível carregar seu painel.')
      setLoading(false)
      return
    }

    setPerfilProfId(perfilProf.id)

    const { data, error } = await supabase
      .from('contatos')
      .select('*, cliente:profiles!contatos_cliente_id_fkey(nome_completo, telefone)')
      .eq('profissional_id', perfilProf.id)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar contatos:', error)
      setErro('Não foi possível carregar seus contatos.')
    } else {
      setContatos(data || [])
    }
    setLoading(false)
  }

  async function recusar(contato) {
    setProcessando(contato.id)
    const { error } = await supabase
      .from('contatos')
      .update({ status: 'recusado' })
      .eq('id', contato.id)

    if (error) console.error('Erro ao recusar:', error)
    await carregar()
    setProcessando(null)
  }

  async function aceitar(contato) {
    setProcessando(contato.id)
    setAvisoConflito('')

    const horario = extrairHorario(contato.turno)

    // Sem data/horário definidos, não dá pra checar conflito de agenda — aceita direto.
    if (!contato.data_desejada || !horario) {
      const { error } = await supabase.from('contatos').update({ status: 'aceito' }).eq('id', contato.id)
      if (error) console.error('Erro ao aceitar:', error)
      await carregar()
      setProcessando(null)
      return
    }

    const dataInicio = `${contato.data_desejada}T${horario.inicio}:00-03:00`
    const dataFim = `${contato.data_desejada}T${horario.fim}:00-03:00`

    const { data: conflitos, error: erroConflito } = await supabase
      .from('agenda_profissional')
      .select('id')
      .eq('profissional_id', perfilProfId)
      .lt('data_inicio', dataFim)
      .gt('data_fim', dataInicio)

    if (erroConflito) {
      console.error('Erro ao checar conflito:', erroConflito)
      setProcessando(null)
      return
    }

    if (conflitos?.length > 0) {
      setAvisoConflito(`Você já tem um compromisso em ${contato.data_desejada} nesse horário. Recuse ou combine outro horário com o cliente.`)
      setProcessando(null)
      return
    }

    const { error: erroAgenda } = await supabase.from('agenda_profissional').insert({
      profissional_id: perfilProfId,
      contato_id: contato.id,
      data_inicio: dataInicio,
      data_fim: dataFim,
      tipo: 'agendamento',
    })

    if (erroAgenda) {
      console.error('Erro ao criar agenda:', erroAgenda)
      setProcessando(null)
      return
    }

    const { error: erroStatus } = await supabase
      .from('contatos')
      .update({ status: 'aceito' })
      .eq('id', contato.id)

    if (erroStatus) console.error('Erro ao atualizar status:', erroStatus)

    await carregar()
    setProcessando(null)
  }

  async function concluir(contato) {
    setProcessando(contato.id)
    const { error } = await supabase
      .from('contatos')
      .update({ status: 'finalizado' })
      .eq('id', contato.id)

    if (error) console.error('Erro ao concluir:', error)
    await carregar()
    setProcessando(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    )
  }

  if (erro) {
    return <p className="text-red-500 text-sm">{erro}</p>
  }

  const pendentes = contatos.filter((c) => c.status === 'pendente')
  const emAndamento = contatos.filter((c) => c.status === 'aceito')
  const historico = contatos.filter((c) => !['pendente', 'aceito'].includes(c.status))

  return (
    <div className="space-y-6">
      {avisoConflito && (
        <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
          {avisoConflito}
        </p>
      )}

      <div>
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Pedidos pendentes ({pendentes.length})
        </h2>

        {pendentes.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum pedido novo por enquanto.</p>
        ) : (
          <div className="space-y-3">
            {pendentes.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {c.cliente?.nome_completo || 'Cliente'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{c.mensagem}</p>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {c.data_desejada && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {c.data_desejada}
                    </span>
                  )}
                  {c.turno && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {TURNO_LABEL[c.turno] || c.turno}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => aceitar(c)}
                    disabled={processando === c.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {processando === c.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                    Aceitar
                  </button>
                  <button
                    onClick={() => recusar(c)}
                    disabled={processando === c.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    <X size={14} /> Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {emAndamento.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Em andamento ({emAndamento.length})
          </h2>
          <div className="space-y-3">
            {emAndamento.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {c.cliente?.nome_completo || 'Cliente'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {c.data_desejada && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {c.data_desejada}
                    </span>
                  )}
                  {c.turno && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {TURNO_LABEL[c.turno] || c.turno}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setChatAberto(c)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
                  >
                    Conversar
                  </button>
                  <button
                    onClick={() => concluir(c)}
                    disabled={processando === c.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {processando === c.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCheck size={14} />}
                    Marcar como concluído
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {historico.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <MessageSquare size={14} /> Histórico
          </h2>
          <div className="space-y-2">
            {historico.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-gray-100 dark:border-neutral-800 px-4 py-3 flex items-center justify-between text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">{c.cliente?.nome_completo || 'Cliente'}</span>
                <span
                  className={
                    c.status === 'finalizado'
                      ? 'text-blue-500'
                      : c.status === 'recusado'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {chatAberto && (
        <ChatContato
          contatoId={chatAberto.id}
          nomeOutraPessoa={chatAberto.cliente?.nome_completo || 'Cliente'}
          onFechar={() => setChatAberto(null)}
        />
      )}
    </div>
  )
}
