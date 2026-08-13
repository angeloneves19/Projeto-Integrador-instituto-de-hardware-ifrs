import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export const TEMA_STORAGE_KEY = 'tema'

// Mesma regra do script inline no index.html, que aplica a classe antes do
// React montar para não piscar o tema errado.
function temaInicial() {
  try {
    const salvo = localStorage.getItem(TEMA_STORAGE_KEY)
    if (salvo === 'dark' || salvo === 'light') return salvo
  } catch {
    // localStorage bloqueado (modo privado): cai na preferência do sistema.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
    try {
      localStorage.setItem(TEMA_STORAGE_KEY, tema)
    } catch {
      // Sem persistência disponível; o tema vale só para esta sessão.
    }
  }, [tema])

  function alternarTema() {
    setTema((atual) => (atual === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ tema, dark: tema === 'dark', alternarTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
