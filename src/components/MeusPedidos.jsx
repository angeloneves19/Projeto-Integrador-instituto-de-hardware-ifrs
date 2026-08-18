import { useEffect, useState } from 'react'
import { Loader2, Calendar, Clock, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

const TURNO_LABEL = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

const STATUS_CONFIG = {
  pendente: { label: 'Aguardando resposta', className: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
  aceito: { label: 'Aceito', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
  recusado: { label: 'Recusado', className: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10' },
  cancelado: { label: 'Cancelado', className: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800' },
  finalizado: { label: 'Finalizado', className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
}

export default function MeusPedidos() {
  const { session } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!session?.user?.id) return

    supabase
      .from('contatos')
      .select('*, profissional:perfis_profissionais(profile:profiles(nome_completo))')
      .eq('cliente_id', session.user.id)
      .order('criado_em', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar pedidos:', error)
          setErro('Não foi possível carregar seus pedidos.')
        } else {
          setPedidos(data || [])
        }
        setLoading(false)
      })
  }, [session?.user?.id])

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
          </div>
        )
      })}
    </div>
  )
}