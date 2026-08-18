import { useEffect, useState } from 'react'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

const ESPECIALIDADES = [
  { valor: 'limpeza_residencial', label: 'Limpeza residencial' },
  { valor: 'cozinha', label: 'Cozinha' },
  { valor: 'passadoria', label: 'Passadoria' },
  { valor: 'organizacao', label: 'Organização' },
  { valor: 'cuidado_infantil', label: 'Cuidado infantil' },
  { valor: 'cuidado_com_idosos', label: 'Cuidado com idosos' },
  { valor: 'jardinagem', label: 'Jardinagem' },
  { valor: 'lavanderia', label: 'Lavanderia' },
]

const DIAS = [
  { valor: 'segunda', label: 'Seg' },
  { valor: 'terca', label: 'Ter' },
  { valor: 'quarta', label: 'Qua' },
  { valor: 'quinta', label: 'Qui' },
  { valor: 'sexta', label: 'Sex' },
  { valor: 'sabado', label: 'Sáb' },
  { valor: 'domingo', label: 'Dom' },
]

export default function EditarPerfilProfissional() {
  const { session } = useAuth()
  const [perfilProfId, setPerfilProfId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)

  const [bio, setBio] = useState('')
  const [anosExperiencia, setAnosExperiencia] = useState('')
  const [cidade, setCidade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [valorMensalidade, setValorMensalidade] = useState('')
  const [regime, setRegime] = useState('diarista')
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState([])
  const [diasSelecionados, setDiasSelecionados] = useState([])
  const [horarioInicio, setHorarioInicio] = useState('08:00')
  const [horarioFim, setHorarioFim] = useState('18:00')

  useEffect(() => {
    carregar()
  }, [session?.user?.id])

  async function carregar() {
    if (!session?.user?.id) return
    setLoading(true)

    const { data: perfilProf, error: erroPerfil } = await supabase
      .from('perfis_profissionais')
      .select('*')
      .eq('profile_id', session.user.id)
      .single()

    if (erroPerfil || !perfilProf) {
      console.error('Erro ao buscar perfil profissional:', erroPerfil)
      setErro('Não foi possível carregar seu perfil.')
      setLoading(false)
      return
    }

    const { data: profileBase } = await supabase
      .from('profiles')
      .select('cidade, telefone')
      .eq('id', session.user.id)
      .single()

    const { data: especialidadesData } = await supabase
      .from('especialidades_profissional')
      .select('especialidade')
      .eq('perfil_prof_id', perfilProf.id)

    setPerfilProfId(perfilProf.id)
    setBio(perfilProf.bio || '')
    setAnosExperiencia(perfilProf.anos_experiencia?.toString() || '')
    setCidade(profileBase?.cidade || '')
    setTelefone(profileBase?.telefone || '')
    setValorDiaria(perfilProf.valor_diaria?.toString() || '')
    setValorMensalidade(perfilProf.valor_mensalidade?.toString() || '')
    setRegime(perfilProf.regime || 'diarista')
    setDiasSelecionados(perfilProf.dias_disponiveis || [])
    setHorarioInicio(perfilProf.horario_inicio?.slice(0, 5) || '08:00')
    setHorarioFim(perfilProf.horario_fim?.slice(0, 5) || '18:00')
    setEspecialidadesSelecionadas((especialidadesData || []).map((e) => e.especialidade))

    setLoading(false)
  }

  function alternarEspecialidade(valor) {
    setEspecialidadesSelecionadas((prev) =>
      prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor]
    )
  }

  function alternarDia(valor) {
    setDiasSelecionados((prev) =>
      prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor]
    )
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setErro('')
    setSalvo(false)
    setSalvando(true)

    try {
      const { error: erroPerfilProf } = await supabase
        .from('perfis_profissionais')
        .update({
          bio: bio.trim() || null,
          anos_experiencia: anosExperiencia ? Number(anosExperiencia) : 0,
          valor_diaria: valorDiaria ? Number(valorDiaria) : null,
          valor_mensalidade: valorMensalidade ? Number(valorMensalidade) : null,
          regime,
          dias_disponiveis: diasSelecionados,
          horario_inicio: horarioInicio,
          horario_fim: horarioFim,
        })
        .eq('id', perfilProfId)

      if (erroPerfilProf) throw erroPerfilProf

      const { error: erroCidade } = await supabase
        .from('profiles')
        .update({ cidade: cidade.trim() || null, telefone: telefone.trim() || null })
        .eq('id', session.user.id)

      if (erroCidade) throw erroCidade

      const { error: erroDelete } = await supabase
        .from('especialidades_profissional')
        .delete()
        .eq('perfil_prof_id', perfilProfId)

      if (erroDelete) throw erroDelete

      if (especialidadesSelecionadas.length > 0) {
        const { error: erroInsert } = await supabase.from('especialidades_profissional').insert(
          especialidadesSelecionadas.map((especialidade) => ({
            perfil_prof_id: perfilProfId,
            especialidade,
          }))
        )
        if (erroInsert) throw erroInsert
      }

      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      setErro('Não foi possível salvar suas alterações. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSalvar} className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6">
      <div>
        <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Sobre você</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Conte sua experiência, especialidades e diferenciais..."
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Anos de experiência</label>
          <input
            type="number"
            min="0"
            value={anosExperiencia}
            onChange={(e) => setAnosExperiencia(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
      </div>

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
        <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Regime de trabalho</label>
        <select
          value={regime}
          onChange={(e) => setRegime(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="diarista">Diarista</option>
          <option value="mensalista">Mensalista</option>
          <option value="meio_periodo">Meio período</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Valor da diária (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={valorDiaria}
            onChange={(e) => setValorDiaria(e.target.value)}
            placeholder="150"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Valor da mensalidade (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={valorMensalidade}
            onChange={(e) => setValorMensalidade(e.target.value)}
            placeholder="2500"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Especialidades</label>
        <div className="flex flex-wrap gap-2">
          {ESPECIALIDADES.map((esp) => {
            const selecionada = especialidadesSelecionadas.includes(esp.valor)
            return (
              <button
                key={esp.valor}
                type="button"
                onClick={() => alternarEspecialidade(esp.valor)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  selecionada
                    ? 'bg-emerald-600 dark:bg-emerald-400 border-emerald-600 dark:border-emerald-400 text-white dark:text-neutral-900'
                    : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300 hover:border-emerald-500'
                }`}
              >
                {esp.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Dias que você atende</label>
        <div className="flex flex-wrap gap-2">
          {DIAS.map((dia) => {
            const selecionado = diasSelecionados.includes(dia.valor)
            return (
              <button
                key={dia.valor}
                type="button"
                onClick={() => alternarDia(dia.valor)}
                className={`w-11 h-11 rounded-lg text-sm border transition-colors ${
                  selecionado
                    ? 'bg-emerald-600 dark:bg-emerald-400 border-emerald-600 dark:border-emerald-400 text-white dark:text-neutral-900'
                    : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300 hover:border-emerald-500'
                }`}
              >
                {dia.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Atende a partir de</label>
          <input
            type="time"
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Atende até</label>
          <input
            type="time"
            value={horarioFim}
            onChange={(e) => setHorarioFim(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
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
