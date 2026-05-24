# TrocaCromos

> Plataforma independente de troca de cromos para colecionadores brasileiros.
> Match automático, chat com antifraude, sistema de reputação, planos premium.

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase (Auth, Postgres, Realtime, RLS) + Mercado Pago**.

---

## 🚀 Setup rápido (5 minutos)

### 1. Pré-requisitos

- Node.js 18.18+ ou 20+
- Conta gratuita no [Supabase](https://supabase.com) (PostgreSQL + Auth + Realtime)
- Opcional: conta no [Mercado Pago](https://www.mercadopago.com.br/developers) (apenas para pagamentos reais — sem isso, a app roda em modo demo)

### 2. Clonar e instalar

```bash
cd trocacromos
npm install
```

### 3. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Anote a **Project URL** e a **anon key** (Settings → API)
3. Copie também a **service_role key** (mantenha em segredo!)
4. No SQL Editor do Supabase, execute na ordem:
   - `supabase/schema.sql` — cria todas as tabelas, triggers, função de match
   - `supabase/policies.sql` — habilita Row Level Security
   - `supabase/seed.sql` — popula coleções de teste (Mundial 2026, Brasileirão, Pokémon TCG)

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=seu@email.com
```

> Para pagamentos reais, adicione também `MERCADO_PAGO_ACCESS_TOKEN`. Sem ele, o checkout entra em modo demo (registra pagamento como pendente sem cobrar).

### 5. Rodar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 6. Tornar-se admin

Após criar sua conta, rode no SQL Editor do Supabase:

```sql
UPDATE public.usuarios SET is_admin = true WHERE email = 'seu@email.com';
```

Depois acesse [/admin](http://localhost:3000/admin).

---

## 🧪 Como testar o fluxo completo

1. **Crie 2 contas** em abas anônimas diferentes (User A e User B)
2. **Faça onboarding** das duas, ambas na mesma cidade
3. Com User A: vá em **Painel → Tenho** e marque, por exemplo, cromos 1-20 da coleção Mundial 2026
4. Com User A: vá em **Preciso** e marque os cromos 50-70
5. Com User B: vá em **Tenho** e marque cromos 50-70 (que A precisa)
6. Com User B: vá em **Preciso** e marque cromos 1-20 (que A tem)
7. Volte para User A → **Trocas encontradas** → você verá User B com matches mútuos
8. Clique em **Propor troca** → mensagem → envia
9. Com User B: receba a proposta em **Minhas trocas**, aceite
10. Conversem em **Conversas** (chat em tempo real via Supabase Realtime)
11. Teste o **antifraude** escrevendo "manda o Pix" no chat — vai aparecer aviso

---

## 📂 Estrutura

```
trocacromos/
├── supabase/
│   ├── schema.sql        # 22 tabelas + função buscar_matches
│   ├── policies.sql      # RLS para isolamento de dados
│   └── seed.sql          # Coleções de teste
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing
│   │   ├── login, signup, onboarding/
│   │   ├── painel/                   # Dashboard (tenho, preciso, matches, trocas)
│   │   ├── conversas/                # Lista + chat individual com Realtime
│   │   ├── perfil/[id]/              # Perfil público com reputação
│   │   ├── cidade/[slug]/            # Hub SEO por cidade
│   │   ├── colecao/[slug]/           # Hub SEO por coleção
│   │   ├── premium, eventos, admin, configuracoes/
│   │   ├── termos, privacidade, anti-golpes, anunciante/
│   │   └── api/
│   │       ├── match/                # RPC buscar_matches
│   │       ├── propostas/            # POST + [id] PATCH
│   │       ├── mensagens/            # POST com antifraude
│   │       ├── denuncias/, avaliacoes/
│   │       ├── pagamentos/           # checkout + webhook MP
│   │       └── admin/users/
│   ├── components/
│   │   ├── ui/ (Button, Input, Card, Badge, Avatar)
│   │   ├── StickerGrid.tsx           # Grade de cromos clicável
│   │   ├── MatchCard.tsx, ProposalModal.tsx
│   │   ├── Navbar.tsx, Disclaimer.tsx
│   ├── lib/
│   │   ├── supabase/ (client, server, middleware)
│   │   ├── antifraude.ts, utils.ts, types.ts
│   └── middleware.ts                 # Refresh de sessão
```

---

## 🔒 Segurança

- **RLS habilitada** em todas as tabelas — usuários só acessam seus próprios dados
- **Antifraude no chat** — detecta padrões de golpe (Pix, comprovante, dados sensíveis)
- **Disclaimer obrigatório** em todas as páginas — plataforma independente
- **Service role key** usada apenas em endpoints admin/webhook (nunca no cliente)
- **Validação Zod** em todos os endpoints de mutação

---

## 💰 Modelo de receita

| Stream | Implementado | Como ativar |
|---|---|---|
| Freemium (Premium R$9,90 / Plus R$19,90) | ✅ | Adicionar `MERCADO_PAGO_ACCESS_TOKEN` |
| Anúncios geolocalizados | ✅ Schema | Implementar inserção via `/anunciante` |
| Microcompras (destaque, cromo-coins) | ✅ Schema | Adicionar checkout específico |
| White-label B2B / API pública | 🔧 | Criar `/api/public/v1/*` com API keys |

---

## 🚢 Deploy

### Vercel (recomendado)

1. Push para GitHub
2. Importe em [vercel.com](https://vercel.com)
3. Adicione as variáveis de ambiente (Settings → Environment Variables)
4. Deploy

### Outros providers

Funciona em qualquer host que suporte Next.js 14 (Netlify, Cloudflare Pages, Railway, AWS Amplify).

---

## 🛠️ Próximas iterações (não incluídas neste MVP-Full)

Estas funcionalidades têm o schema/RPC pronto e UI base, mas merecem desenvolvimento dedicado:

- [ ] OCR de cromos por foto (FastAPI + PyTorch separado)
- [ ] Match triangular (A→B→C→A) — adicionar função SQL `buscar_matches_triangulares`
- [ ] App mobile React Native (Expo) — pode compartilhar `src/lib`
- [ ] Marketplace de acessórios (plásticos, álbuns avulsos)
- [ ] Seguro de troca (parceria com seguradora)
- [ ] White-label B2B com API keys versionadas
- [ ] PostHog para analytics e A/B testing
- [ ] Sentry para erros em produção

---

## ⚖️ Aviso legal

**TrocaCromos é uma plataforma independente.** Não somos afiliados, patrocinados, autorizados ou
endossados pela FIFA, Panini, CBF ou qualquer entidade esportiva, editora ou marca oficial. Todas
as marcas mencionadas pertencem aos seus respectivos titulares.

Antes de operar em produção, consulte um advogado para revisar termos, privacidade (LGPD) e
disclaimer de marca, especialmente se planejar usar logos ou referências a coleções oficiais.

---

## 📝 Licença

Código próprio. Use, modifique e venda livremente para seu projeto.
