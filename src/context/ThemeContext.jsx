import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export const TEMA_STORAGE_KEY = 'tema'

function temaInicial() {
  try {
    const salvo = localStorage.getItem(TEMA_STORAGE_KEY)
    if (salvo === 'dark' || salvo === 'light') return salvo
  } catch {
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
