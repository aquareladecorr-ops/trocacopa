# 🧠 MEMÓRIA DO PROJETO — TrocaCopa

> Arquivo de contexto para o agente AI continuar o desenvolvimento sem perder estado.
> **Atualizado:** 2026-05-25

---

## 🌐 Infraestrutura

| Item | Valor |
|------|-------|
| **Domínio** | https://www.trocacopa.com |
| **Repositório** | https://github.com/aquareladecorr-ops/trocacopa |
| **Vercel projeto** | aquareladecorr-ops-projects/trocacopa |
| **Supabase projeto** | clhuuqcbbuunxeeidims |
| **Supabase URL** | https://clhuuqcbbuunxeeidims.supabase.co |
| **Anon key** | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsaHV1cWNiYnV1bnhlZWlkaW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTAwODksImV4cCI6MjA5NTEyNjA4OX0.MGZ06QX7Ajwt7W65qU5hYafMy4LhcKOZ27TxwzuOTvQ |
| **Stack** | Next.js 14 App Router + TypeScript + Tailwind + Supabase |

---

## 👥 Usuários de Teste

| Nome | ID | Email | Senha | Notas |
|------|----|-------|-------|-------|
| jose | 66fe4fa0-c7f5-4b8c-826f-ec1a136f1e8b | quadrosaquareladecor@gmail.com | (auth normal) | Usuário principal de testes |
| joseluizlobojunior | a9cea554-a0bd-4f3b-b25d-6d6f35ef8cfa | joseluizlobojunior@gmail.com | Teste@2026 | Conta de teste secundária |
| BANCA NET | b8543748-eb8b-42c2-b161-a0772f49e12e | mdrmaniaderelogio@gmail.com | (recovery enviado) | Conta adicional |

**Conversa de teste:** dc516910-996a-4cde-b015-f25677f31c02 (jose ↔ joseluizlobojunior)

---

## 🗄️ Schema do Banco (Tabelas Principais)

```
usuarios          — perfis de usuários (id, nome, email, cidade, bairro, estado, foto_url, plano...)
colecoes          — álbuns/coleções (id, slug, nome, total_figurinhas, ativa...)
figurinhas        — cromos de cada coleção (id, colecao_id, codigo, numero, nome...)
faltantes         — figurinhas que o usuário precisa (usuario_id, figurinha_id, colecao_id)
repetidas         — figurinhas repetidas do usuário (usuario_id, figurinha_id, colecao_id, qtd)
conversas         — chats entre usuários (id, participante_a, participante_b)
mensagens         — mensagens do chat (conversa_id, remetente_id, conteudo, tipo, lida_em)
propostas         — propostas de troca (remetente_id, destinatario_id, colecao_id, status...)
notificacoes      — notificações (retorna 503 — problema pré-existente, não abordar)
```

**Funções SQL importantes:**
- `buscar_matches(p_user_id uuid, p_colecao_id uuid, p_limite int DEFAULT 50)` → retorna matches entre usuários
- ⚠️ O código frontend usava `encontrar_matches` (errado) — já corrigido para `buscar_matches`

**Coleção principal:** Mundial de Futebol 2026
- ID: `4eeee496-64ba-4644-9591-0adf68648c0b`
- Slug: `mundial-2026`

---

## 🏗️ Estrutura de Arquivos Importantes

```
src/
├── app/
│   ├── page.tsx                    — Homepage (hero + tagline + grid demo)
│   ├── login/page.tsx              — Login com link "Esqueci minha senha"
│   ├── signup/page.tsx             — Cadastro
│   ├── recuperar-senha/page.tsx    — Solicitar reset de senha
│   ├── reset-password/page.tsx     — Redefinir senha (processa hash token)
│   └── painel/
│       ├── matches/page.tsx        — Trocas encontradas + Mapa Leaflet + filtro cidade
│       ├── conversas/[id]/page.tsx — Chat realtime entre usuários
│       └── ...
├── components/
│   ├── Navbar.tsx                  — Navbar com badge realtime de mensagens
│   ├── MatchCard.tsx               — Card de match com botão "💬 Conversar"
│   ├── MapaMatches.tsx             — Mapa Leaflet com marcadores por cidade
│   └── ui/
│       └── Button.tsx              — Variantes: primary | secondary | ghost | danger | yellow
└── lib/
    ├── types.ts                    — Interfaces TypeScript (Usuario, MatchRow, Colecao...)
    └── supabase/
        ├── client.ts
        └── server.ts
```

---

## ✅ Funcionalidades Implementadas

- [x] Homepage com design limpo (fundo branco, badge amarelo, headline preto/verde)
- [x] Grid demo de figurinhas (Sua coleção: verde=tenho, amarelo=repetida, cinza=falta)
- [x] Tagline "TROQUE FIGURINHAS COM QUEM ESTÁ / PERTO DE VOCÊ." no hero
- [x] Navbar com nome "TrocaCopa" (Troca verde + Copa preto)
- [x] Chat realtime entre usuários (Supabase Realtime + REPLICA IDENTITY FULL)
- [x] Badge de mensagens não lidas na Navbar (realtime INSERT+UPDATE)
- [x] Conversa criada automaticamente ao clicar "💬 Conversar" nos matches
- [x] Recuperação de senha (/recuperar-senha + /reset-password com hash token parsing)
- [x] Página de matches com mapa Leaflet + OpenStreetMap (sem API key)
- [x] Filtro por cidade no mapa — dropdown com contagem por cidade
- [x] Toggle "Ver/Ocultar mapa"
- [x] Botão "📍 Só minha cidade" para filtrar matches
- [x] RPC corrigida: `buscar_matches` (estava chamando `encontrar_matches` incorretamente)

---

## 🐛 Bugs Conhecidos

| Bug | Status | Notas |
|-----|--------|-------|
| `notificacoes` retorna 503 | ⚠️ Pré-existente | Não abordar a menos que solicitado |
| Dois tabs no mesmo browser compartilham localStorage | ⚠️ Limitação do browser | Usar incógnito para testar dois usuários |

---

## 🔧 Regras de Desenvolvimento

### GitHub (editar arquivos)
```js
// Padrão para editar no CodeMirror do GitHub:
const el = document.querySelector('.cm-content');
el.focus();
document.execCommand('selectAll');
document.execCommand('insertText', false, novoConteudo);
```
- **SEMPRE** fazer fetch do arquivo atual antes de editar (evitar perder conteúdo)
- Verificar build Vercel ✅ antes de considerar tarefa completa

### Supabase SQL Editor
```js
window.monaco.editor.getEditors()[0].setValue(sql);
// Então Ctrl+Return para executar
```

### Regras críticas
- NUNCA quebrar `window.fetch`
- Build DEVE passar (✅ Ready no Vercel) antes de finalizar
- JWT tokens expiram a cada hora
- `localStorage` é compartilhado entre abas do mesmo domínio

---

## 📦 Dependências Notáveis

```json
{
  "leaflet": "^1.9.4",
  "@types/leaflet": "^1.9.14",
  "next": "14.2.15",
  "@supabase/ssr": "^0.5.2",
  "@supabase/supabase-js": "^2.45.4",
  "tailwindcss": "^3.4.13"
}
```

---

## 🎨 Design System

| Token | Valor |
|-------|-------|
| Verde principal | `text-green-600` / `bg-green-600` (`brand-green`) |
| Amarelo badge | `bg-yellow-400` |
| Texto escuro | `text-gray-900` / `text-ink-900` |
| Fundo | `bg-white` |
| Button variants | `primary` (verde) | `ghost` | `secondary` | `danger` | `yellow` |

---

## 🚀 Últimos Commits (ordem cronológica)

1. `bf0af0a` — recuperar-senha: página de solicitação de reset
2. `24c18c4` — reset-password: página de redefinição de senha
3. `eed0327` — loMEMORIA.mdgin: adiciona link Esqueci minha senha
4. `05bd891` — reset-password: corrige setSession com tokens do hash da URL
5. `3ef7cde` — MatchCard: adiciona botão Conversar que cria/abre conversa
6. `0cf4c8d` — homepage: redesign visual identico ao mockup de referencia
7. `6b8319a` ❌ — Navbar: corrompeu arquivo (bug selectAll parcial)
8. `7692d82` ✅ — Navbar: restaura arquivo e renomeia TrocaCromos para TrocaCopa
9. `19c9b42` — homepage: adiciona tagline TROQUE FIGURINHAS COM QUEM ESTA PERTO DE VOCE
10. `6f5a64f` — deps: adiciona leaflet e @types/leaflet para mapa
11. `7030d3f` — MapaMatches: componente de mapa Leaflet com filtro por cidade
12. `af54de6` ❌ — matches: variant Button outline->ghost (tinha outro erro)
13. `c740c15` ✅ — matches: mapa Leaflet com filtro por cidade e zoom (funcionando)
14. `9696d08` ✅ — fix: corrige RPC encontrar_matches -> buscar_matches

---

## ⚡ Próximos Passos Sugeridos

- Adicionar figurinhas reais dos usuários (faltantes e repetidas) para mais matches aparecerem
- Testar fluxo completo: cadastro → marcar faltantes/repetidas → ver matches no mapa → conversar
- Implementar sistema de notificações (tabela `notificacoes` retorna 503 atualmente)
- Verificar se o mapa mostra marcadores quando há matches com cidades cadastradas
