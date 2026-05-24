# MEMORY.md — TrocaCopa (TrocaCromos)

## Contexto do Projeto
Plataforma de troca de figurinhas/cromos. Usuários cadastram suas figurinhas repetidas e faltantes, o sistema encontra matches automaticamente e facilita trocas via chat.

## Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Deploy**: Vercel (auto-deploy a partir de push no main)
- **Domínio**: trocacopa.com (DNS via Hostinger)

## Infraestrutura
- **Supabase Project ID**: clhuuqcbbuunxeeidims
- **GitHub Repo**: aquareladecorr-ops/trocacopa
- **Vercel Project**: aquareladecorr-ops-projects/trocacopa
- **Google Auth**: OAuth configurado, callback em /auth/callback/route.ts

## Banco de Dados (tabelas principais)
- `usuarios`: perfil + onboarding (37 colunas)
- `colecoes`: coleções disponíveis (ex: mundial-2026, brasileirao-2026, pokemon-tcg-base)
- `figurinhas`: figurinhas de cada coleção
- `repetidas`: figurinhas repetidas do usuário (qty >= 1)
- `faltantes`: figurinhas que o usuário precisa
- `conversas`: chat entre dois usuários (participante_a, participante_b)
- `mensagens`: mensagens de uma conversa
- `propostas`: proposta de troca enviada
- `acordos_troca`: acordo finalizado entre dois usuários

## Coleções Ativas
| Slug | Nome | Total |
|------|------|-------|
| mundial-2026 | Mundial de Futebol 2026 | 980 |
| brasileirao-2026 | Brasileirao 2026 | 400 |
| pokemon-tcg-base | Pokemon TCG - Base | 200 |

## Estrutura Mundial 2026 (980 figurinhas)
- FWC001-FWC020: Introdução/capa (20)
- 48 seleções × 20 figurinhas cada = 960
- Total: 980

## Histórico de Correções

### Sessão 1 (upload inicial)
- Upload dos arquivos para o repositório
- Configuração do Supabase e Vercel
- Deploy inicial

### Sessão 2 (correções de bugs)
1. **980 figurinhas**: seed.sql corrigido de 670 para 980 (estrutura real Copa 2026)
2. **StickerGrid**: classe `group` adicionada para botões +/- aparecerem no hover
3. **Tenho (repetidas)**: botão "Salvar cadastro" + batch save adicionado
4. **Preciso (faltantes)**: botão "Salvar cadastro" + batch save adicionado
5. **Painel**: nome do usuário com fallback (perfil.nome → user_metadata → email prefix)
6. **Painel**: % completo agora conta registros reais na tabela repetidas
7. **Painel**: encoding corrigido (HTML entities)
8. **MEMORY.md**: criado

### Sessão 3 (correções do chat)
1. **Pokemon encoding**: UPDATE colecoes SET nome='Pokemon TCG - Base' executado no Supabase
2. **Realtime**: ALTER PUBLICATION supabase_realtime ADD TABLE mensagens/conversas
3. **Trigger**: fn_atualiza_conversa_ultima_msg criado para atualizar ultima_msg_em/preview
4. **conversas/page.tsx**: query reescrita sem join ambíguo (dois FK para usuarios)
   - Agora busca participante_a/b direto e faz lookup separado de perfis
5. **ProposalModal.tsx**: melhorado com:
   - useRouter + redirect para conversa após envio
   - Verifica conversa duplicada antes de criar nova
   - Remove notificação (tabela com RLS restrita)
6. **auth/callback/route.ts**: criado para OAuth Google (estava faltando)

## Arquivos Principais
- `src/app/painel/page.tsx` — dashboard do usuário
- `src/app/painel/tenho/page.tsx` — cadastro de repetidas
- `src/app/painel/preciso/page.tsx` — cadastro de faltantes
- `src/app/painel/matches/page.tsx` — trocas encontradas
- `src/app/conversas/page.tsx` — lista de conversas
- `src/app/conversas/[id]/page.tsx` — chat individual
- `src/app/auth/callback/route.ts` — OAuth callback
- `src/components/StickerGrid.tsx` — grade de figurinhas (reutilizável)
- `src/components/ProposalModal.tsx` — modal de proposta de troca
- `supabase/schema.sql` — estrutura do banco
- `supabase/policies.sql` — RLS policies
- `supabase/seed.sql` — dados iniciais (coleções + figurinhas)

## Estado Atual (após sessão 3)
- ✅ 980 figurinhas no banco (correto)
- ✅ Botão salvar em tenho e preciso
- ✅ Painel com nome/% corretos
- ✅ Chat com realtime habilitado
- ✅ Trigger de ultima_msg atualizado
- ✅ Auth callback para Google OAuth
- ✅ Encoding Pokemon TCG corrigido
- ⏳ Mercado Pago env vars (não configurado)
- ⏳ Testar fluxo completo de proposta→chat com dois usuários reais

## Pendente
- Configurar variáveis MERCADOPAGO_* no Vercel
- Testar OAuth Google no fluxo completo
- Testar criação de conversa e envio de mensagens com dois usuários


## Sessao 4 — 2026-05-24 (correcao bugs salvar + menu painel + performance)

### Bugs corrigidos

**Bug 1: Menu dropdown nao tinha "Painel"**
- Arquivo: src/components/Navbar.tsx
- Fix: adicionado link Painel no dropdown
- Commit: 9a1fcf9

**Bug 2: Variaveis de ambiente no Vercel estavam erradas**
- NEXT_PUBLIC_SUPABASE_URL estava vazio — setado para https://clhuuqcbbuunxeeidims.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY tinha valor "a" (um char) — setado para a chave correta
- SUPABASE_SERVICE_ROLE_KEY estava vazio — setado para a chave correta
- Deploy JBAyY1cgf recriado com as env vars corretas

**Bug 3: Usuario jose nao existia em public.usuarios**
- FK violation em repetidas_user_id_fkey
- Usuario existia em auth.users mas nao em public.usuarios
- Fix: INSERT do usuario em public.usuarios
- Fix: criado trigger on_auth_user_created para auto-criar registro em usuarios no signup

**Bug 4: JWT expirado**
- Access token do usuario estava expirado
- Fix: refreshed manualmente via /auth/v1/token

**Bug 5: Performance — StickerGrid travando com 980 items**
- Re-render de 980 items a cada clique por falta de memoizacao
- Fix: adicionado React.memo no StickerItem + useCallback para handlers + separacao do useMemo de texto e marcacao
- Arquivo: src/components/StickerGrid.tsx
- Commit: 1b3bb24

### Tabelas importantes
- repetidas: colunas sao user_id, figurinha_id, quantidade, reservada_para, atualizado_em (NAO tem created_at)
- faltantes: similar ao repetidas
- usuarios: colunas NOT NULL = nome, email, cidade, estado


## Sessao 5 — 2026-05-24 (correcao enviar mensagem no chat)

### Bug: Enviar mensagem no chat nao funcionava

**Erro:** column "ultima_msg_preview" of relation "conversas" does not exist

**Causa raiz:** Triggers na tabela mensagens chamavam fn_atualiza_conversa_ultima_msg() que tentava atualizar coluna inexistente na tabela conversas.

**Fix aplicado no Supabase:**
ALTER TABLE public.conversas ADD COLUMN IF NOT EXISTS ultima_msg_preview TEXT;

**Colunas da tabela conversas apos fix:**
id, participante_a, participante_b, acordo_id, ultima_msg_em, arquivada, criado_em, ultima_msg_preview


---

## Sessão 6 — Bugfix: Envio de mensagem (token expirado / auto-refresh)

**Data:** 24/05/2026

**Problema:** Campo de mensagem limpava ao clicar "Enviar" mas a mensagem não era salva no banco nem aparecia no chat. Sem mensagem de erro visível.

**Causa raiz:**
- O Supabase client era recriado a cada chamada de `createClient()`, impedindo o auto-refresh do token.
- O token JWT expirava após 1h e o cliente recriado usava o token expirado do cookie.
- O Supabase PostgREST retorna HTTP 201 mesmo quando o RLS bloqueia o insert (falha silenciosa).

**Fixes aplicados:**
1. `src/lib/supabase/client.ts` (commit `fa6a021`): Transformado em singleton para garantir auto-refresh de token funcionar corretamente.
2. `src/app/conversas/[id]/page.tsx` (commit `f5d8166`): Adicionado `supabase.auth.getSession()` antes do insert para validar/renovar sessão. Erros explícitos quando sessão expirada.

**Resultado:** Chat de mensagens funcionando — envio, realtime e listagem de conversas OK.

**Commits:** fa6a021 (client singleton) | f5d8166 (page.tsx session validation)
