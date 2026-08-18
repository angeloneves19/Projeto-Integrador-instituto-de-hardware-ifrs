import { useEffect, useRef, useState } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function ChatContato({ contatoId, nomeOutraPessoa, onFechar }) {
  const { session } = useAuth()
  const [mensagens, setMensagens] = useState([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const fimDaListaRef = useRef(null)

  useEffect(() => {
    carregar()

    const canal = supabase
      .channel(`chat-${contatoId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens_contato', filter: `contato_id=eq.${contatoId}` },
        (payload) => {
          setMensagens((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [contatoId])

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase
      .from('mensagens_contato')
      .select('*')
      .eq('contato_id', contatoId)
      .order('criado_em', { ascending: true })

    if (error) {
      console.error('Erro ao carregar mensagens:', error)
    } else {
      setMensagens(data || [])
    }
    setLoading(false)
  }

  async function enviar(e) {
    e.preventDefault()
    if (!texto.trim()) return

    setEnviando(true)
    const { error } = await supabase.from('mensagens_contato').insert({
      contato_id: contatoId,
      remetente_id: session.user.id,
      texto: texto.trim(),
    })

    if (error) {
      console.error('Erro ao enviar mensagem:', error)
    } else {
      setTexto('')
    }
    setEnviando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md h-[70vh] sm:h-[600px] bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-neutral-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
          <span className="font-medium text-gray-900 dark:text-white">{nomeOutraPessoa}</span>
          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-emerald-500" size={22} />
            </div>
          ) : mensagens.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-8">
              Nenhuma mensagem ainda. Diga oi! 👋
            </p>
          ) : (
            mensagens.map((m) => {
              const minha = m.remetente_id === session.user.id
              return (
                <div key={m.id} className={`flex ${minha ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      minha
                        ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-neutral-900'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    {m.texto}
                    <p className={`text-[10px] mt-1 ${minha ? 'text-emerald-100 dark:text-neutral-700' : 'text-gray-400'}`}>
                      {new Date(m.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={fimDaListaRef} />
        </div>

        <form onSubmit={enviar} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-neutral-800">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 disabled:opacity-50"
          >
            {enviando ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}