import { useEffect, useRef, useState } from 'react'
import { Bell, Check, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

function tempoAtras(dataISO) {
  const diffMs = Date.now() - new Date(dataISO).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d}d`
}

export default function NotificationBell() {
  const { session } = useAuth()
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  useEffect(() => {
    if (!session?.user?.id) return
    carregar()

    // Escuta novas notificações chegando em tempo real.
    const canal = supabase
      .channel('notificacoes-usuario')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificacoes', filter: `usuario_id=eq.${session.user.id}` },
        () => carregar()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [session?.user?.id])

  useEffect(() => {
    function fecharAoClicarFora(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Erro ao buscar notificações:', error)
    } else {
      setNotificacoes(data || [])
    }
    setLoading(false)
  }

  async function marcarComoLida(id) {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
    const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
    if (error) console.error('Erro ao marcar como lida:', error)
  }

  async function marcarTodasComoLidas() {
    const idsNaoLidas = notificacoes.filter((n) => !n.lida).map((n) => n.id)
    if (idsNaoLidas.length === 0) return

    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    const { error } = await supabase.from('notificacoes').update({ lida: true }).in('id', idsNaoLidas)
    if (error) console.error('Erro ao marcar todas como lidas:', error)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((v) => !v)}
        className="relative p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {naoLidas > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg z-20">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Notificações</span>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="text-xs text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
              >
                <Check size={12} /> Marcar todas
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-emerald-500" size={20} />
            </div>
          ) : notificacoes.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8 px-4">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
              {notificacoes.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.lida && marcarComoLida(n.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    n.lida
                      ? 'hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                      : 'bg-emerald-50/60 dark:bg-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.lida && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                    <div className={n.lida ? 'pl-3.5' : ''}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{n.titulo}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{n.mensagem}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{tempoAtras(n.criado_em)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}