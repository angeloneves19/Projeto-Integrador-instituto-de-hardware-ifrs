import { useState } from "react";
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
import { useTheme } from "../context/ThemeContext.jsx";
import personagem from "../assets/personagem-2.png";

function TrustItem({ icon: Icon, title, subtitle }) {
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
  const { dark, alternarTema } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("E-mail ou senha inválidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4 py-10 transition-colors">
      <div className="w-full max-w-6xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden relative transition-colors">
        <button
          type="button"
          onClick={alternarTema}
          className="absolute top-5 right-5 z-10 p-2 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
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
              Bem-vindo de volta! 
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10 mb-3">
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
          <p>© 2026 Doméstica A Caminho. Todos os direitos reservados.</p>
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