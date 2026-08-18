import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, BadgeCheck, Clock, Loader2, MessageCircle, Send, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

const ESPECIALIDADES_LABEL = {
  limpeza_residencial: 'Limpeza residencial',
  cozinha: 'Cozinha',
  passadoria: 'Passadoria',
  organizacao: 'Organização',
  cuidado_infantil: 'Cuidado infantil',
  cuidado_com_idosos: 'Cuidado com idosos',
  jardinagem: 'Jardinagem',
  lavanderia: 'Lavanderia',
}

const DIAS_LABEL = {
  segunda: 'Seg', terca: 'Ter', quarta: 'Qua', quinta: 'Qui',
  sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom',
}

// Gera os horários de 1h em 1h, das 7h às 20h (último bloco: 20h às 21h).
function gerarSlots() {
  const slots = []
  for (let h = 7; h <= 20; h++) {
    const inicio = `${String(h).padStart(2, '0')}:00`
    const fim = `${String(h + 1).padStart(2, '0')}:00`
    slots.push({ inicio, fim })
  }
  return slots
}
const SLOTS = gerarSlots()

export default function PerfilProfissional() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const [mostrarForm, setMostrarForm] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [dataDesejada, setDataDesejada] = useState('')
  const [slotEscolhido, setSlotEscolhido] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [enviado, setEnviado] = useState(false)

  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [checandoAgenda, setChecandoAgenda] = useState(false)

  useEffect(() => {
    supabase
      .from('busca_profissionais')
      .select('*')
      .eq('perfil_prof_id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar perfil:', error)
          setErro('Não foi possível carregar esse perfil.')
        } else {
          setPerfil(data)
        }
        setLoading(false)
      })
  }, [id])

  // Toda vez que a data muda, busca os blocos já ocupados nesse dia (agenda real da profissional).
  useEffect(() => {
    setSlotEscolhido(null)

    if (!dataDesejada || !perfil?.perfil_prof_id) {
      setHorariosOcupados([])
      return
    }

    setChecandoAgenda(true)
    const inicioDia = `${dataDesejada}T00:00:00-03:00`
    const fimDia = `${dataDesejada}T23:59:59-03:00`

    supabase
      .from('agenda_profissional')
      .select('data_inicio, data_fim')
      .eq('profissional_id', perfil.perfil_prof_id)
      .lt('data_inicio', fimDia)
      .gt('data_fim', inicioDia)
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao checar agenda:', error)
          setHorariosOcupados([])
        } else {
          setHorariosOcupados(data || [])
        }
        setChecandoAgenda(false)
      })
  }, [dataDesejada, perfil?.perfil_prof_id])

  function slotEstaOcupado(slot) {
    const inicioSlot = new Date(`${dataDesejada}T${slot.inicio}:00-03:00`).getTime()
    const fimSlot = new Date(`${dataDesejada}T${slot.fim}:00-03:00`).getTime()
    return horariosOcupados.some((bloco) => {
      const blocoInicio = new Date(bloco.data_inicio).getTime()
      const blocoFim = new Date(bloco.data_fim).getTime()
      return blocoInicio < fimSlot && blocoFim > inicioSlot
    })
  }

  async function handleEnviarContato(e) {
    e.preventDefault()
    setErroEnvio('')

    if (mensagem.trim().length < 10) {
      setErroEnvio('Escreva uma mensagem um pouco mais detalhada (mínimo 10 caracteres).')
      return
    }

    if (dataDesejada && !slotEscolhido) {
      setErroEnvio('Escolha um horário disponível.')
      return
    }

    setEnviando(true)
    try {
      const { error } = await supabase.from('contatos').insert({
        cliente_id: session.user.id,
        profissional_id: perfil.perfil_prof_id,
        mensagem: mensagem.trim(),
        data_desejada: dataDesejada || null,
        turno: slotEscolhido ? `${slotEscolhido.inicio} às ${slotEscolhido.fim}` : null,
      })
      if (error) throw error
      setEnviado(true)
    } catch (err) {
      console.error('Erro ao enviar contato:', err)
      setErroEnvio('Não foi possível enviar sua mensagem. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="animate-spin text-emerald-500" size={28} />
      </div>
    )
  }

  if (erro || !perfil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950 gap-3">
        <p className="text-gray-500 dark:text-gray-400">{erro || 'Perfil não encontrado.'}</p>
        <button onClick={() => navigate(-1)} className="text-emerald-500 hover:text-emerald-600 font-medium">
          Voltar
        </button>
      </div>
    )
  }

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{perfil.nome_completo}</h1>
                {perfil.verificada && <BadgeCheck className="text-emerald-500" size={20} />}
              </div>
              {perfil.cidade && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {perfil.cidade}{perfil.estado ? `, ${perfil.estado}` : ''}
                </p>
              )}
            </div>
            {perfil.media_avaliacoes > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                {Number(perfil.media_avaliacoes).toFixed(1)}
                <span className="text-gray-400 font-normal">({perfil.total_avaliacoes})</span>
              </div>
            )}
          </div>

          {perfil.bio && (
            <p className="text-gray-600 dark:text-gray-300 mb-5">{perfil.bio}</p>
          )}

          {perfil.especialidades?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Especialidades</p>
              <div className="flex flex-wrap gap-1.5">
                {perfil.especialidades.map((esp) => (
                  <span
                    key={esp}
                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    {ESPECIALIDADES_LABEL[esp] || esp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {perfil.dias_disponiveis?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Clock size={14} /> Disponibilidade
              </p>
              <div className="flex flex-wrap gap-1.5">
                {perfil.dias_disponiveis.map((dia) => (
                  <span
                    key={dia}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"
                  >
                    {DIAS_LABEL[dia] || dia}
                  </span>
                ))}
              </div>
              {(perfil.horario_inicio || perfil.horario_fim) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Horário: {perfil.horario_inicio?.slice(0, 5) || '--'} às {perfil.horario_fim?.slice(0, 5) || '--'}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-neutral-800">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Valor da diária</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {perfil.valor_diaria ? `R$ ${Number(perfil.valor_diaria).toFixed(0)}` : 'A combinar'}
              </p>
            </div>

            {!mostrarForm && !enviado && (
              <button
                onClick={() => setMostrarForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 font-medium transition-colors"
              >
                <MessageCircle size={18} /> Entrar em contato
              </button>
            )}
          </div>

          {/* Formulário de contato */}
          {mostrarForm && !enviado && (
            <form onSubmit={handleEnviarContato} className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800 space-y-4">
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Mensagem</label>
                <textarea
                  required
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={4}
                  placeholder="Conte um pouco sobre o serviço que você precisa..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Data desejada</label>
                <input
                  type="date"
                  min={hoje}
                  value={dataDesejada}
                  onChange={(e) => setDataDesejada(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {dataDesejada && (
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Escolha o horário</label>

                  {checandoAgenda ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                      <Loader2 className="animate-spin" size={12} /> Verificando disponibilidade...
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {SLOTS.map((slot) => {
                        const ocupado = slotEstaOcupado(slot)
                        const selecionado =
                          slotEscolhido?.inicio === slot.inicio && slotEscolhido?.fim === slot.fim

                        return (
                          <button
                            key={slot.inicio}
                            type="button"
                            disabled={ocupado}
                            onClick={() => setSlotEscolhido(slot)}
                            className={`text-sm py-2 rounded-lg border transition-colors ${
                              ocupado
                                ? 'border-gray-100 dark:border-neutral-800 text-gray-300 dark:text-neutral-700 line-through cursor-not-allowed'
                                : selecionado
                                ? 'bg-emerald-600 dark:bg-emerald-400 border-emerald-600 dark:border-emerald-400 text-white dark:text-neutral-900 font-medium'
                                : 'border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-600'
                            }`}
                          >
                            {slot.inicio}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {!checandoAgenda && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Horários riscados já estão ocupados nessa data. Cada bloco tem duração de 1h.
                    </p>
                  )}
                </div>
              )}

              {erroEnvio && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                  {erroEnvio}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || checandoAgenda || (dataDesejada && !slotEscolhido)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 font-medium transition-colors disabled:opacity-70"
                >
                  {enviando ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Enviar mensagem
                </button>
              </div>
            </form>
          )}

          {/* Confirmação de envio */}
          {enviado && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={22} />
              <p className="font-medium">Mensagem enviada! A profissional vai receber sua solicitação.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}