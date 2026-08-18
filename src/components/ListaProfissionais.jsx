import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, MapPin, BadgeCheck, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

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

export default function ListaProfissionais() {
  const navigate = useNavigate()
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    supabase
      .from('busca_profissionais')
      .select('*')
      .order('media_avaliacoes', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar profissionais:', error)
          setErro('Não foi possível carregar os profissionais agora.')
        } else {
          setProfissionais(data || [])
        }
        setLoading(false)
      })
  }, [])

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

  if (profissionais.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Nenhuma profissional disponível no momento.
      </p>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {profissionais.map((p) => (
        <div
          key={p.perfil_prof_id}
          className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-gray-900 dark:text-white">{p.nome_completo}</h3>
                {p.verificada && <BadgeCheck className="text-emerald-500" size={16} />}
              </div>
              {p.cidade && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} /> {p.cidade}{p.estado ? `, ${p.estado}` : ''}
                </p>
              )}
            </div>
            {p.media_avaliacoes > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 shrink-0">
                <Star className="text-yellow-400 fill-yellow-400" size={14} />
                {Number(p.media_avaliacoes).toFixed(1)}
              </div>
            )}
          </div>

          {p.bio && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{p.bio}</p>
          )}

          {p.especialidades?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {p.especialidades.map((esp) => (
                <span
                  key={esp}
                  className="text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  {ESPECIALIDADES_LABEL[esp] || esp}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-neutral-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {p.valor_diaria ? (
                <>A partir de <span className="font-semibold text-gray-900 dark:text-white">R$ {Number(p.valor_diaria).toFixed(0)}</span>/dia</>
              ) : (
                'Valor a combinar'
              )}
            </div>
            <button
              onClick={() => navigate(`/profissional/${p.perfil_prof_id}`)}
              className="text-sm font-medium text-emerald-500 hover:text-emerald-600"
            >
              Ver perfil
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}