# Doméstica A Caminho

Plataforma que conecta **clientes** a **profissionais domésticas** (diaristas, cuidadoras, etc.) — com cadastro, busca, agendamento com controle de conflito de horário e mensagens em tempo real.

Construída com **React + Vite + Tailwind CSS + Supabase**.

## Índice

- [O que o projeto faz](#o-que-o-projeto-faz)
- [Stack utilizada](#stack-utilizada)
- [Funcionalidades](#funcionalidades)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Passo a passo para iniciar o projeto](#passo-a-passo-para-iniciar-o-projeto)
- [Problemas comuns](#problemas-comuns)
- [Modelo de dados](#modelo-de-dados)
- [Próximos passos](#próximos-passos)

## O que o projeto faz

Existem dois tipos de conta:

- **Cliente** — busca profissionais disponíveis, abre o perfil de cada uma, escolhe uma data e um horário exato, e envia um pedido de contato. Depois acompanha se o pedido foi aceito ou recusado.
- **Profissional** — recebe os pedidos em um painel, aceita ou recusa cada um, tem uma agenda automática (calendário) com os compromissos aceitos, e edita seu próprio perfil (bio, valores, especialidades, dias e horários de atendimento).

O sistema **bloqueia automaticamente** conflitos de agenda: se uma profissional já tem um compromisso confirmado das 17h às 18h em um dia, nenhum outro cliente consegue marcar esse mesmo horário com ela.

Toda a parte de login, banco de dados e regras de permissão roda no **Supabase** (Postgres + Auth + Row Level Security + Realtime).

## Stack utilizada

| Camada | Tecnologia |
|---|---|
| Front-end | React 18 + Vite |
| Estilo | Tailwind CSS v4 |
| Rotas | React Router DOM |
| Backend / banco | Supabase (Postgres, Auth, RLS, Realtime) |
| Ícones | lucide-react |

## Funcionalidades

- ✅ Login e cadastro (cliente ou profissional), com tema claro/escuro
- ✅ Validação de CPF, e-mail e senha
- ✅ Dashboard diferente para cada tipo de usuário
- ✅ Busca de profissionais ativas (cards com avaliação, especialidades e preço)
- ✅ Página de perfil detalhado de cada profissional
- ✅ Pedido de contato com escolha de data e **horário exato** (blocos de 1h)
- ✅ Checagem automática de conflito de horário (ao pedir e ao aceitar)
- ✅ Painel do profissional: aceitar ou recusar pedidos
- ✅ Agenda em formato de calendário com os compromissos aceitos
- ✅ "Meus pedidos" — cliente acompanha o status de cada solicitação
- ✅ Notificações em tempo real (sino no topo, via Supabase Realtime)
- ✅ Edição de perfil da profissional (bio, valores, especialidades, disponibilidade)

## Estrutura de pastas

```
src/
  assets/                         imagens (ex: ilustração do login)
  components/
    ListaProfissionais.jsx        cards de busca (lado cliente)
    PainelContatos.jsx            pedidos recebidos (lado profissional)
    MeusPedidos.jsx                status dos pedidos enviados (lado cliente)
    AgendaProfissional.jsx        calendário de compromissos
    EditarPerfilProfissional.jsx  formulário de edição de perfil
    NotificationBell.jsx          sino de notificações em tempo real
  context/
    AuthContext.jsx               sessão, signIn, signUp, signOut
    useProfile.js                  busca o perfil do usuário logado
  lib/
    supabaseClient.js             conexão com o Supabase
  pages/
    Login.jsx
    Cadastro.jsx
    Dashboard.jsx                  roteia o conteúdo certo por tipo de usuário
    PerfilProfissional.jsx        visualização + formulário de contato
  App.jsx                          rotas (react-router-dom)
  main.jsx                         ponto de entrada
database/
  schema.sql                       schema completo (tabelas, triggers, RLS, views)
```

## Passo a passo para iniciar o projeto

### 1. Pré-requisitos

- [Node.js](https://nodejs.org) instalado (versão LTS). Confira com:
  ```bash
  node -v
  ```
- Uma conta gratuita no [Supabase](https://supabase.com)

### 2. Instalar as dependências

Na pasta do projeto, abra o terminal e rode:

```bash
npm install
```

### 3. Criar o projeto no Supabase (se ainda não tiver um)

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Aguarde alguns minutos até ele terminar de provisionar

### 4. Rodar o schema do banco

1. No painel do Supabase, abra o **SQL Editor**
2. Cole todo o conteúdo do arquivo `database/schema.sql`
3. Clique em **Run**

Isso cria todas as tabelas, tipos, triggers, views e políticas de segurança de uma vez.

### 5. Garantir as permissões básicas

Ainda no **SQL Editor**, rode também:

```sql
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON public.busca_profissionais TO authenticated, anon;
GRANT SELECT ON public.painel_profissional TO authenticated;
```

### 6. Habilitar cadastro de novos usuários

No painel do Supabase: **Authentication → Sign In / Providers** → ative **"Allow new users to sign up"**.

Para facilitar os testes, você também pode desativar a confirmação por e-mail em **Email → Confirm email** (assim o login funciona na hora, sem precisar clicar em um link de confirmação).

### 7. Pegar as chaves do projeto

Em **Project Settings → API Keys**, copie:
- A **Project URL**
- A **Publishable key** (ou `anon` key, se for um projeto mais antigo)

### 8. Configurar o `.env`

Na raiz do projeto, crie um arquivo chamado `.env` com:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 9. Rodar o projeto

```bash
npm run dev
```

Acesse **http://localhost:5173** no navegador.

### 10. Testar

Crie uma conta em `/cadastro` (escolhendo cliente ou profissional) e explore o Dashboard.

## Problemas comuns

**Erro 403 / "permission denied for table"**
Faltam as permissões básicas de schema — rode o passo 5 acima.

**Cadastro dá erro "O cadastro está desativado no servidor"**
Faltou ativar "Allow new users to sign up" (passo 6).

**Página fica em branco ou trava ao abrir**
O projeto gratuito do Supabase pausa depois de alguns dias sem uso. Entre no painel do Supabase — se ele estiver pausado, vai aparecer um botão para reativar. Espere um ou dois minutos e tente de novo.

**Erro `Failed to resolve import "..."`**
Algum arquivo mencionado no import ainda não foi criado, ou o nome/caminho está diferente do esperado. Confira se o arquivo existe exatamente com esse nome, na pasta certa.

## Modelo de dados

Principais tabelas (schema completo em `database/schema.sql`):

| Tabela | Descrição |
|---|---|
| `profiles` | Dados básicos de todo usuário (ligado 1:1 a `auth.users`) |
| `perfis_profissionais` | Dados extras de quem é profissional (bio, valores, status) |
| `especialidades_profissional` | Especialidades de cada profissional |
| `contatos` | Pedidos enviados por clientes às profissionais |
| `agenda_profissional` | Compromissos confirmados (criados ao aceitar um contato) |
| `avaliacoes` | Avaliações de clientes sobre profissionais |
| `favoritos` | Profissionais salvas como favoritas pelo cliente |
| `notificacoes` | Notificações internas (novo contato, pedido respondido) |

Views auxiliares:
- `busca_profissionais` — lista pública de profissionais ativas
- `painel_profissional` — dados agregados para o dashboard da profissional

Quando um usuário se cadastra, o trigger `handle_new_user` já cria automaticamente a linha em `profiles` (e em `perfis_profissionais`, se for do tipo profissional).

## Próximos passos

- Avaliações (cliente avaliar profissional após serviço finalizado)
- Favoritos (cliente salvar profissionais preferidas)
- Filtros de busca (cidade, especialidade, faixa de preço)
- Upload de foto de perfil (Supabase Storage)
- Reativar confirmação de e-mail antes de colocar em produção

