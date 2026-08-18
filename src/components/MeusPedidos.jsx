import { useEffect, useState } from 'react'
import { Loader2, Calendar, Clock, MessageSquare, Star, Send } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import ChatContato from './ChatContato.jsx'

const TURNO_LABEL = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

const STATUS_CONFIG = {
  pendente: { label: 'Aguardando resposta', className: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
  aceito: { label: 'Aceito', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
  recusado: { label: 'Recusado', className: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10' },
  cancelado: { label: 'Cancelado', className: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800' },
  finalizado: { label: 'Concluído', className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
}

function FormularioAvaliacao({ contato, onAvaliado }) {
  const [nota, setNota] = useState(0)
  const [notaHover, setNotaHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar() {
    setErro('')
    if (nota === 0) {
      setErro('Escolha de 1 a 5 estrelas.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.from('avaliacoes').insert({
      contato_id: contato.id,
      cliente_id: contato.cliente_id,
      profissional_id: contato.profissional_id,
      nota,
      comentario: comentario.trim() || null,
    })

    if (error) {
      console.error('Erro ao enviar avaliação:', error)
      setErro('Não foi possível enviar sua avaliação. Tente novamente.')
      setEnviando(false)
      return
    }

    onAvaliado()
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-3">
      <p className="text-sm font-medium text-gray-900 dark:text-white">Como foi o serviço?</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((valor) => (
          <button
            key={valor}
            type="button"
            onClick={() => setNota(valor)}
            onMouseEnter={() => setNotaHover(valor)}
            onMouseLeave={() => setNotaHover(0)}
          >
            <Star
              size={24}
              className={
                valor <= (notaHover || nota)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-neutral-700'
              }
            />
          </button>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={2}
        placeholder="Conte como foi (opcional)"
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
      />

      {erro && <p className="text-xs text-red-500">{erro}</p>}

      <button
        onClick={enviar}
        disabled={enviando}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 text-sm font-medium transition-colors disabled:opacity-60"
      >
        {enviando ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
        Enviar avaliação
      </button>
    </div>
  )
}

export default function MeusPedidos() {
  const { session } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [chatAberto, setChatAberto] = useState(null)

  useEffect(() => {
    carregar()
  }, [session?.user?.id])

  async function carregar() {
    if (!session?.user?.id) return
    setLoading(true)

    const { data, error } = await supabase
      .from('contatos')
      .select('*, profissional:perfis_profissionais(profile:profiles(nome_completo)), avaliacao:avaliacoes(nota, comentario, resposta_profissional)')
      .eq('cliente_id', session.user.id)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar pedidos:', error)
      setErro('Não foi possível carregar seus pedidos.')
    } else {
      setPedidos(data || [])
    }
    setLoading(false)
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

  if (pedidos.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Você ainda não enviou nenhum pedido de contato.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {pedidos.map((p) => {
        const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.pendente
        const avaliacao = Array.isArray(p.avaliacao) ? p.avaliacao[0] : p.avaliacao

        return (
          <div
            key={p.id}
            className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {p.profissional?.profile?.nome_completo || 'Profissional'}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${status.className}`}>
                {status.label}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex items-start gap-1.5">
              <MessageSquare size={14} className="mt-0.5 shrink-0 text-gray-400" />
              {p.mensagem}
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              {p.data_desejada && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {p.data_desejada}
                </span>
              )}
              {p.turno && (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {TURNO_LABEL[p.turno] || p.turno}
                </span>
              )}
            </div>

            {p.resposta && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
                <p className="text-xs text-gray-400 mb-1">Resposta da profissional:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{p.resposta}</p>
              </div>
            )}

            {(p.status === 'aceito' || p.status === 'finalizado') && (
              <button
                onClick={() => setChatAberto(p)}
                className="mt-3 text-sm font-medium text-emerald-500 hover:text-emerald-600"
              >
                Conversar
              </button>
            )}

            {p.status === 'finalizado' && !avaliacao && (
              <FormularioAvaliacao contato={p} onAvaliado={carregar} />
            )}

            {avaliacao && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      size={14}
                      className={v <= avaliacao.nota ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-neutral-700'}
                    />
                  ))}
                </div>
                {avaliacao.comentario && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{avaliacao.comentario}</p>
                )}
                {avaliacao.resposta_profissional && (
                  <p className="text-xs text-gray-400 mt-1">
                    Resposta: {avaliacao.resposta_profissional}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {chatAberto && (
        <ChatContato
          contatoId={chatAberto.id}
          nomeOutraPessoa={chatAberto.profissional?.profile?.nome_completo || 'Profissional'}
          onFechar={() => setChatAberto(null)}
        />
      )}
    </div>
  )
}