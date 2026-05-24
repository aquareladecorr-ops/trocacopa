# MEMORY.md — TrocaCopa Project Context

> Arquivo de memória do projeto para uso com assistentes de IA (Claude, Cursor, Copilot, etc.)
> Última atualização: 2026-05-24

---

## Visão Geral do Projeto

**TrocaCopa** é uma plataforma de troca de figurinhas do álbum Panini Copa do Mundo FIFA 2026.
- **URL de produção:** https://trocacopa.com
- **Repositório:** https://github.com/aquareladecorr-ops/trocacopa
- **Organização GitHub:** aquareladecorr-ops

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14.2.15 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| Deploy | Vercel (projeto: trocacopa) |
| Pagamentos | Mercado Pago (pendente configuração) |
| Domínio | trocacopa.com (Hostinger DNS) |

---

## Infraestrutura

### Vercel
- **Projeto:** trocacopa (aquareladecorr-ops-projects)
- **URL Vercel:** https://trocacopa.vercel.app
- **Framework detectado:** Next.js
- **Variáveis de ambiente configuradas:**
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_APP_URL = https://trocacopa.com
  - MERCADO_PAGO_ACCESS_TOKEN (pendente)
  - MERCADO_PAGO_PUBLIC_KEY (pendente)

### Supabase
- **Projeto ID:** clhuuqcbbuunxeeidims
- **Projeto nome:** trocacromos
- **Organização:** aquareladecorr-ops
- **URL:** https://clhuuqcbbuunxeeidims.supabase.co
- **Auth - Site URL:** https://trocacopa.com
- **Auth - Redirect URLs:** https://trocacopa.com/**, https://www.trocacopa.com/**
- **Google OAuth:** habilitado (Client ID configurado)

### Domínio (Hostinger)
- trocacopa.com → aponta para Vercel (CNAME)
- www.trocacopa.com → aponta para Vercel (CNAME)

---

## Banco de Dados (Schema)

### Tabelas principais

#### colecoes
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| slug | TEXT UNIQUE | ex: 'mundial-2026' |
| nome | TEXT | Nome exibido |
| ano | INT | 2026 |
| categoria | TEXT | 'futebol', 'tcg' |
| total_figurinhas | INT | Total da coleção |
| descricao | TEXT | Descrição |
| ativa | BOOL | Se está ativa |

**Coleções cadastradas:**
- mundial-2026 → 980 figurinhas
- brasileirao-2026 → 400 figurinhas
- pokemon-tcg-base → 200 figurinhas

#### figurinhas
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| colecao_id | UUID | FK colecoes |
| codigo | TEXT | ex: 'BRA1', 'FWC001' |
| numero | INT | Número sequencial |
| nome | TEXT | Nome da figurinha |
| raridade | TEXT | 'comum', 'rara', 'especial', 'legend' |
| tipo | TEXT | 'jogador', 'escudo', 'estadio', 'logo', 'card' |

**Mundial 2026 - Estrutura das 980 figurinhas:**
- FWC001-FWC020: Introdução (logos, troféu, sedes, estádios) — especiais/metaliz.
- Para cada 1 das 48 seleções: 1 escudo (especial) + 1 foto time (rara) + 18 jogadores
- 48 seleções × 20 figurinhas = 960 + 20 intro = 980 total
- Distribuição: 68 especiais (metalizadas) + 912 couché

**48 Seleções por Grupo:**
- Grupo A: QAT, ECU, SEN, NED
- Grupo B: ENG, IRI, USA, WAL
- Grupo C: ARG, SAU, MEX, POL
- Grupo D: FRA, AUS, DEN, TUN
- Grupo E: ESP, CRC, GER, JPN
- Grupo F: BEL, CAN, MAR, CRO
- Grupo G: BRA, SRB, SUI, CMR
- Grupo H: POR, GHA, URU, KOR
- Grupo I: NZL, NOR, COL, PAN
- Grupo J: RSA, EGY, NGA, MLI
- Grupo K: SAL, HND, VEN, IRQ
- Grupo L: ITA, ALB, CZE, UKR

#### usuarios
- 37 colunas (incluindo onboarding, localização, preferências)
- Colunas críticas: onboarding_completo, cidade, bairro, uf, whatsapp, contato_preferido, forma_troca

#### repetidas
- user_id, figurinha_id, quantidade
- Constraint unique: (user_id, figurinha_id)

#### faltantes
- user_id, figurinha_id

---

## Estrutura do Código

```
src/
  app/
    painel/
      tenho/page.tsx      ← Cadastro de repetidas (com botão Salvar)
      preciso/page.tsx    ← Cadastro de faltantes
      matches/            ← Trocas encontradas
      trocas/             ← Minhas trocas
    onboarding/           ← Fluxo de 2 passos pós-cadastro
    colecao/[slug]/       ← Página da coleção
    login/                ← Login
    signup/               ← Cadastro
    premium/              ← Plano premium
    conversas/            ← Chat entre usuários
    eventos/              ← Eventos de troca
  components/
    StickerGrid.tsx       ← Grade de figurinhas (suporta mode=tenho|preciso)
    Navbar.tsx
    MatchCard.tsx
    ProposalModal.tsx
  lib/
    supabase/client.ts    ← Supabase client-side
    types.ts              ← Tipos TypeScript
supabase/
  schema.sql              ← DDL completo
  policies.sql            ← RLS policies
  seed.sql                ← Dados iniciais (atualizado 2026-05-24)
  migration.sql           ← Migrações aplicadas (31 ALTER TABLE)
```

---

## Histórico de Correções Importantes

### 2026-05-24 — Sessão de Setup Completo
1. **Build fix** (projeto antigo troca-cromos-facil): NotFound.tsx usava named export → corrigido para default export
2. **Novo projeto Vercel** criado: trocacopa (importado do GitHub)
3. **6 env vars** configuradas no Vercel
4. **Domínio** trocacopa.com + www.trocacopa.com configurados
5. **Schema SQL** executado: schema.sql + policies.sql + seed.sql
6. **Auth Google**: Site URL corrigida (localhost → https://trocacopa.com), Redirect URLs adicionadas
7. **Migration**: 31 colunas adicionadas à tabela usuarios (onboarding_completo, cidade, bairro, uf, etc.)
8. **Seed atualizado**: Mundial 2026 com 980 figurinhas corretas (antes tinha 670 do álbum 2022)
9. **Botão Salvar**: StickerGrid e tenho/page.tsx corrigidos — salvamento em lote com feedback visual

---

## Problemas Conhecidos / Pendentes

| # | Problema | Status | Observação |
|---|---------|--------|-----------|
| 1 | src/app/auth/callback/route.ts não existe | Pendente | Necessário para Google OAuth funcionar completamente |
| 2 | Mercado Pago não configurado | Pendente | Faltam env vars: MERCADO_PAGO_ACCESS_TOKEN, MERCADO_PAGO_PUBLIC_KEY, MERCADO_PAGO_WEBHOOK_SECRET |
| 3 | Nome do usuário não aparece no Painel ("Olá, !") | Pendente | Verificar coluna nome/display_name na tabela usuarios |

---

## Padrões de Desenvolvimento

### Como executar SQL no Supabase (via Management API)
```javascript
// Em qualquer tab do dashboard.supabase.com
const tokenData = localStorage.getItem('supabase.dashboard.auth.token');
const token = JSON.parse(tokenData)?.access_token;
fetch('https://api.supabase.com/v1/projects/clhuuqcbbuunxeeidims/database/query', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'SELECT 1' })
}).then(r => r.json()).then(console.log);
```

### Auth Callback Route (pendente criação)
Criar `src/app/auth/callback/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/painel';
  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, request.url));
}
```

---

## Contato / Organização
- **Conta GitHub/Vercel/Supabase:** aquareladecorr-ops
- **Email:** quadrosaquareladecor@gmail.com

