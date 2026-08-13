import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Star,
  CalendarCheck,
  Headphones,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import personagem from "../assets/personagem-2.png";
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.88-3c-1.08.72-2.46 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.31A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.4-2.31V6.6H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.4z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.6l4 3.09C6.25 6.87 8.89 4.77 12 4.77z"
      />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
      <path d="M24 12.07C24 5.67 18.63.4 12 .4S0 5.67 0 12.07c0 5.78 4.39 10.58 10.13 11.45v-8.1H7.08v-3.35h3.05V9.41c0-3 1.8-4.67 4.55-4.67 1.32 0 2.7.23 2.7.23v2.95h-1.52c-1.5 0-1.97.92-1.97 1.87v2.24h3.36l-.54 3.35h-2.82v8.1C19.61 22.65 24 17.85 24 12.07z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className="fill-gray-900 dark:fill-white"
    >
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.24 3.05-.97 1.02-2.15 1.6-3.4 1.5-.13-1.13.42-2.3 1.2-3.1.83-.85 2.2-1.47 3.44-1.45zM20.7 17.2c-.42 1-.9 1.9-1.53 2.75-.85 1.15-1.55 1.95-2.5 1.97-.9.02-1.2-.58-2.4-.58-1.2 0-1.55.56-2.4.6-.94.04-1.66-.84-2.5-1.98-1.68-2.32-2.97-6.56-1.24-9.42.85-1.4 2.38-2.29 4.03-2.32 1.07-.02 1.94.63 2.55.63.6 0 1.7-.78 2.87-.66.5.02 1.9.2 2.8 1.5-.07.05-1.67 1-1.65 2.94.02 2.32 2.03 3.09 2.05 3.09-.02.06-.3 1.06-1.08 2.48z" />
    </svg>
  );
}
function TrustItem( { icon: Icon, title, subtitle } ) {
  return (
    <div className="flex items-start gap-3 px-6 py-6">
      <Icon className="text-emerald-500 shrink-0" size={20} />
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
export default function Login() {
  const [dark, setDark] = useState( true );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [showPassword, setShowPassword] = useState( false );
  const [error, setError] = useState( "" );
  const [loading, setLoading] = useState( false );
  const { signIn } = useAuth();
  const navigate = useNavigate();
  useEffect( () => {
    document.documentElement.classList.toggle( "dark", dark );
  }, [dark] );
  async function handleSubmit( e ) {
    e.preventDefault();
    setError( "" );
    setLoading( true );
    try {
      await signIn( email, password );
      navigate( "/dashboard" );
    } catch ( err ) {
      setError( "E-mail ou senha inválidos. Tente novamente." );
    } finally {
      setLoading( false );
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4 py-10 transition-colors">
      <div className="w-full max-w-6xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden relative transition-colors">
        <button
          onClick={() => setDark( !dark )}
          className="absolute top-5 right-5 z-10 p-2 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Alternar tema"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="grid md:grid-cols-2">
          <div className="p-8 sm:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                <Home className="text-white" size={24} />
              </div>
              <div>
                <p className="text-lg leading-tight text-gray-900 dark:text-white font-semibold">
                  Doméstica
                  <br />
                  <span className="text-emerald-500">A Caminho</span>
                </p>
                <p className="text-[10px] tracking-[0.15em] text-gray-400 dark:text-gray-500 uppercase mt-1">
                  Plataforma de profissionais
                </p>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl leading-tight text-gray-900 dark:text-white mb-4 font-semibold">
              Conectando confiança, profissionalismo e cuidado{" "}
              <span className="text-emerald-500">para o seu lar.</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
              Acesse sua conta para encontrar os melhores profissionais e
              gerenciar seus agendamentos com praticidade.
            </p>
            <img
              src={personagem}
              alt="Profissional doméstica"
              className="w-full h-auto max-w-sm mx-auto"
            />
          </div>
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-1 font-semibold">
              Bem-vindo de volta! 👋
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Faça login para continuar.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={( e ) => setEmail( e.target.value )}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={( e ) => setPassword( e.target.value )}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword( !showPassword )}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500 text-white dark:text-neutral-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                Entrar
              </button>
            </form>
            <div className="flex items-center gap-3 my-7">
              <span className="h-px flex-1 bg-gray-200 dark:bg-neutral-800" />
              <span className="text-xs text-gray-400 uppercase">Ou</span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-neutral-800" />
            </div>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <GoogleIcon /> Entrar com Google
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <FacebookIcon /> Entrar com Facebook
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <AppleIcon /> Entrar com Apple
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 mb-3">
              Ainda não tem uma conta?
            </p>
            <Link
              to="/cadastro"
              className="block text-center py-3 rounded-lg border border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-medium transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200 dark:divide-neutral-800 border-t border-gray-200 dark:border-neutral-800">
          <TrustItem
            icon={ShieldCheck}
            title="Perfis verificados"
            subtitle="Segurança e confiança"
          />
          <TrustItem
            icon={Star}
            title="Avaliações reais"
            subtitle="Experiências de quem contratou"
          />
          <TrustItem
            icon={CalendarCheck}
            title="Agendamento fácil"
            subtitle="Combine horários com praticidade"
          />
          <TrustItem
            icon={Headphones}
            title="Suporte dedicado"
            subtitle="Acompanhamento humanizado"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-8 py-5 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-neutral-800">
          <p>© 2024 Doméstica A Caminho. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-500">
              Termos de uso
            </a>
            <a href="#" className="hover:text-emerald-500">
              Política de privacidade
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
