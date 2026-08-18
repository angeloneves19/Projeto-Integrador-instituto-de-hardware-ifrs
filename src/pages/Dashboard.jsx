import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/useProfile.js'
import ListaProfissionais from '../components/ListaProfissionais.jsx'
import PainelContatos from '../components/PainelContatos.jsx'
import MeusPedidos from '../components/MeusPedidos.jsx'
import NotificationBell from '../components/NotificationBell.jsx'
import AgendaProfissional from '../components/AgendaProfissional.jsx'
import EditarPerfilProfissional from '../components/EditarPerfilProfissional.jsx'
import EditarPerfilCliente from '../components/EditarPerfilCliente.jsx'
import { Loader2 } from 'lucide-react'

export default function Dashboard() {
  const { signOut } = useAuth()
  const { profile, loading } = useProfile()
  const [aba, setAba] = useState('buscar')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="animate-spin text-emerald-500" size={28} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Olá, {profile?.nome_completo || 'usuário'}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {profile?.tipo === 'profissional' ? 'Painel do profissional' : 'Encontre profissionais de confiança'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {profile?.tipo === 'profissional' ? (
          <>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setAba('buscar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  aba === 'buscar'
                    ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-neutral-900'
                    : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Pedidos
              </button>
              <button
                onClick={() => setAba('pedidos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  aba === 'pedidos'
                    ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-neutral-900'
                    : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Agenda
              </button>
              <button
                onClick={() => setAba('perfil')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  aba === 'perfil'
                    ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-neutral-900'
                    : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Meu perfil
              </button>
            </div>

            {aba === 'buscar' ? <PainelContatos /> : aba === 'pedidos' ? <AgendaProfissional /> : <EditarPerfilProfissional />}
          </>
        ) : (
          <>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setAba('buscar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  aba === 'buscar'
                    ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-neutral-900'
                    : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Buscar profissionais
              </button>
              <button
                onClick={() => setAba('pedidos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  aba === 'pedidos'
                    ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-neutral-900'
                    : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Meus pedidos
              </button>
              <button
                onClick={() => setAba('perfil')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  aba === 'perfil'
                    ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-neutral-900'
                    : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Meu perfil
              </button>
            </div>

            {aba === 'buscar' ? <ListaProfissionais /> : aba === 'pedidos' ? <MeusPedidos /> : <EditarPerfilCliente />}
          </>
        )}
      </div>
    </div>
  )
}