-- =====================================================================
-- TrocaCromos - Schema PostgreSQL completo (Supabase)
-- =====================================================================
-- Execute este arquivo no SQL Editor do Supabase em ordem:
-- 1) schema.sql (este)
-- 2) policies.sql (RLS)
-- 3) seed.sql (dados iniciais)
-- =====================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============== USUÁRIOS ==============
-- Tabela espelho do auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cidade TEXT,
  bairro TEXT,
  estado CHAR(2),
  cep TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  whatsapp TEXT,
  whatsapp_oculto BOOLEAN DEFAULT true,
  instagram TEXT,
  bio TEXT,
  foto_url TEXT,
  contato_preferido TEXT CHECK (contato_preferido IN ('whatsapp','chat_interno','email')) DEFAULT 'chat_interno',
  forma_troca TEXT CHECK (forma_troca IN ('presencial','envio','ambos')) DEFAULT 'ambos',
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free','premium','plus')),
  plano_ate TIMESTAMPTZ,
  destaque_ate TIMESTAMPTZ,
  cromo_coins INT DEFAULT 0,
  verificado BOOLEAN DEFAULT false,
  verificado_em TIMESTAMPTZ,
  reputacao DECIMAL(3,2) DEFAULT 0,
  trocas_concluidas INT DEFAULT 0,
  banido BOOLEAN DEFAULT false,
  banido_motivo TEXT,
  is_admin BOOLEAN DEFAULT false,
  onboarding_completo BOOLEAN DEFAULT false,
  ultimo_acesso TIMESTAMPTZ DEFAULT now(),
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- ============== COLEÇÕES E FIGURINHAS ==============
CREATE TABLE IF NOT EXISTS public.colecoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  ano INT,
  categoria TEXT,
  total_figurinhas INT DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  cover_url TEXT,
  descricao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.figurinhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colecao_id UUID NOT NULL REFERENCES public.colecoes(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  numero INT,
  nome TEXT,
  categoria TEXT,
  tipo TEXT,
  raridade TEXT DEFAULT 'comum' CHECK (raridade IN ('comum','rara','legend','especial')),
  UNIQUE (colecao_id, codigo)
);

-- ============== REPETIDAS E FALTANTES ==============
CREATE TABLE IF NOT EXISTS public.repetidas (
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  figurinha_id UUID NOT NULL REFERENCES public.figurinhas(id) ON DELETE CASCADE,
  quantidade INT NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, figurinha_id)
);

CREATE TABLE IF NOT EXISTS public.faltantes (
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  figurinha_id UUID NOT NULL REFERENCES public.figurinhas(id) ON DELETE CASCADE,
  prioridade INT DEFAULT 0,
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, figurinha_id)
);

-- ============== PROPOSTAS E ACORDOS ==============
CREATE TABLE IF NOT EXISTS public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  destinatario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  colecao_id UUID REFERENCES public.colecoes(id),
  oferta JSONB NOT NULL DEFAULT '[]'::jsonb,
  pedido JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aceita','rejeitada','contraproposta','expirada','cancelada')),
  mensagem TEXT,
  forma_troca TEXT,
  expira_em TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.acordos_troca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID REFERENCES public.propostas(id),
  user_a UUID NOT NULL REFERENCES public.usuarios(id),
  user_b UUID NOT NULL REFERENCES public.usuarios(id),
  itens_a_para_b JSONB,
  itens_b_para_a JSONB,
  forma_troca TEXT,
  local_encontro TEXT,
  data_encontro TIMESTAMPTZ,
  codigo_rastreio_a TEXT,
  codigo_rastreio_b TEXT,
  seguro BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'aceito' CHECK (status IN ('aceito','em_andamento','concluido','disputado','cancelado')),
  concluido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- ============== CHAT ==============
CREATE TABLE IF NOT EXISTS public.conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_a UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  participante_b UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  acordo_id UUID REFERENCES public.acordos_troca(id),
  proposta_id UUID REFERENCES public.propostas(id),
  ultima_msg_em TIMESTAMPTZ,
  ultima_msg_preview TEXT,
  arquivada BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversas_participantes
  ON public.conversas (participante_a, participante_b);

CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID NOT NULL REFERENCES public.conversas(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL REFERENCES public.usuarios(id),
  conteudo TEXT NOT NULL,
  tipo TEXT DEFAULT 'texto' CHECK (tipo IN ('texto','imagem','sistema','codigo_rastreio')),
  anexo_url TEXT,
  flagged_antifraude BOOLEAN DEFAULT false,
  lida_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_conversa
  ON public.mensagens (conversa_id, criado_em DESC);

-- ============== REPUTAÇÃO E DENÚNCIAS ==============
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acordo_id UUID REFERENCES public.acordos_troca(id),
  avaliador_id UUID NOT NULL REFERENCES public.usuarios(id),
  avaliado_id UUID NOT NULL REFERENCES public.usuarios(id),
  nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE (acordo_id, avaliador_id)
);

CREATE TABLE IF NOT EXISTS public.denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  denunciante_id UUID NOT NULL REFERENCES public.usuarios(id),
  denunciado_id UUID NOT NULL REFERENCES public.usuarios(id),
  acordo_id UUID REFERENCES public.acordos_troca(id),
  motivo TEXT NOT NULL,
  detalhes TEXT,
  evidencias JSONB,
  status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta','em_analise','procedente','improcedente')),
  resolvida_por UUID REFERENCES public.usuarios(id),
  resolucao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  resolvido_em TIMESTAMPTZ
);

-- ============== PAGAMENTOS ==============
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.usuarios(id),
  produto TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  moeda TEXT DEFAULT 'BRL',
  status TEXT CHECK (status IN ('pendente','aprovado','recusado','reembolsado','estornado')) DEFAULT 'pendente',
  gateway TEXT DEFAULT 'mercadopago',
  gateway_id TEXT,
  metodo TEXT,
  validade_ate TIMESTAMPTZ,
  recorrente BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- ============== ANÚNCIOS ==============
CREATE TABLE IF NOT EXISTS public.anunciantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.usuarios(id),
  razao_social TEXT,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  responsavel TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anunciante_id UUID REFERENCES public.anunciantes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  link TEXT,
  cidades TEXT[] DEFAULT '{}',
  bairros TEXT[] DEFAULT '{}',
  estados CHAR(2)[] DEFAULT '{}',
  formato TEXT DEFAULT 'banner',
  pacote TEXT DEFAULT 'local_basico',
  data_inicio DATE,
  data_fim DATE,
  budget DECIMAL(10,2),
  impressoes INT DEFAULT 0,
  cliques INT DEFAULT 0,
  aprovado BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- ============== COMUNIDADE ==============
CREATE TABLE IF NOT EXISTS public.grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('cidade','bairro','colecao','tematico')),
  cidade TEXT,
  bairro TEXT,
  colecao_id UUID REFERENCES public.colecoes(id),
  privado BOOLEAN DEFAULT false,
  criador_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grupo_membros (
  grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  papel TEXT DEFAULT 'membro' CHECK (papel IN ('membro','moderador','admin')),
  entrou_em TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (grupo_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  local TEXT,
  cidade TEXT,
  estado CHAR(2),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  organizador_id UUID REFERENCES public.usuarios(id),
  anunciante_id UUID REFERENCES public.anunciantes(id),
  patrocinado BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.evento_rsvps (
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'vai' CHECK (status IN ('vai','talvez','nao_vai')),
  check_in TIMESTAMPTZ,
  PRIMARY KEY (evento_id, user_id)
);

-- ============== NOTIFICAÇÕES ==============
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  link TEXT,
  lida BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_user
  ON public.notificacoes (user_id, lida, criado_em DESC);

-- ============== ÍNDICES CRÍTICOS ==============
CREATE INDEX IF NOT EXISTS idx_usuarios_cidade ON public.usuarios (cidade, estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_plano ON public.usuarios (plano);
CREATE INDEX IF NOT EXISTS idx_repetidas_figurinha ON public.repetidas (figurinha_id);
CREATE INDEX IF NOT EXISTS idx_faltantes_figurinha ON public.faltantes (figurinha_id);
CREATE INDEX IF NOT EXISTS idx_propostas_destinatario ON public.propostas (destinatario_id, status);
CREATE INDEX IF NOT EXISTS idx_propostas_remetente ON public.propostas (remetente_id, status);

-- ============== TRIGGERS ==============
-- Mantém atualizado_em
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_atualizado ON public.usuarios;
CREATE TRIGGER trg_usuarios_atualizado BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

DROP TRIGGER IF EXISTS trg_propostas_atualizado ON public.propostas;
CREATE TRIGGER trg_propostas_atualizado BEFORE UPDATE ON public.propostas
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- Cria registro em public.usuarios quando alguém faz signup no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualiza ultima_msg da conversa quando nova mensagem é inserida
CREATE OR REPLACE FUNCTION public.update_conversa_last_msg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversas
  SET ultima_msg_em = NEW.criado_em,
      ultima_msg_preview = LEFT(NEW.conteudo, 80)
  WHERE id = NEW.conversa_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_msg_atualiza_conversa ON public.mensagens;
CREATE TRIGGER trg_msg_atualiza_conversa AFTER INSERT ON public.mensagens
  FOR EACH ROW EXECUTE FUNCTION public.update_conversa_last_msg();

-- Recalcula reputação após nova avaliação
CREATE OR REPLACE FUNCTION public.recalc_reputacao()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.usuarios
  SET reputacao = (
    SELECT ROUND(AVG(nota)::numeric, 2)
    FROM public.avaliacoes
    WHERE avaliado_id = NEW.avaliado_id
  )
  WHERE id = NEW.avaliado_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalc_reputacao ON public.avaliacoes;
CREATE TRIGGER trg_recalc_reputacao AFTER INSERT ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.recalc_reputacao();

-- =====================================================================
-- FUNÇÃO DE MATCH (SQL) - cruza repetidas/faltantes e retorna matches
-- =====================================================================
CREATE OR REPLACE FUNCTION public.buscar_matches(
  p_user_id UUID,
  p_colecao_id UUID,
  p_limite INT DEFAULT 50,
  p_mesma_cidade_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
  user_b_id UUID,
  user_b_nome TEXT,
  user_b_cidade TEXT,
  user_b_bairro TEXT,
  user_b_estado CHAR(2),
  user_b_foto_url TEXT,
  user_b_reputacao DECIMAL,
  user_b_plano TEXT,
  user_b_verificado BOOLEAN,
  trocas_possiveis INT,
  a_oferece JSONB,
  b_oferece JSONB,
  score DECIMAL
) AS $$
DECLARE
  v_cidade TEXT;
  v_bairro TEXT;
  v_estado CHAR(2);
BEGIN
  SELECT cidade, bairro, estado INTO v_cidade, v_bairro, v_estado
  FROM public.usuarios WHERE id = p_user_id;

  RETURN QUERY
  WITH
    rep_a AS (
      SELECT r.figurinha_id, r.quantidade
      FROM public.repetidas r
      JOIN public.figurinhas f ON f.id = r.figurinha_id
      WHERE r.user_id = p_user_id AND f.colecao_id = p_colecao_id
    ),
    falt_a AS (
      SELECT fa.figurinha_id
      FROM public.faltantes fa
      JOIN public.figurinhas f ON f.id = fa.figurinha_id
      WHERE fa.user_id = p_user_id AND f.colecao_id = p_colecao_id
    ),
    candidatos AS (
      SELECT DISTINCT r.user_id
      FROM public.repetidas r
      WHERE r.figurinha_id IN (SELECT figurinha_id FROM falt_a)
        AND r.user_id != p_user_id
    ),
    matches AS (
      SELECT
        u.id AS user_b_id,
        u.nome,
        u.cidade,
        u.bairro,
        u.estado,
        u.foto_url,
        u.reputacao,
        u.plano,
        u.verificado,
        u.destaque_ate,
        u.ultimo_acesso,
        -- Figurinhas que A pode dar para B (rep A ∩ falt B)
        COALESCE(
          (SELECT jsonb_agg(jsonb_build_object('figurinha_id', ra.figurinha_id, 'qtd', ra.quantidade))
           FROM rep_a ra
           WHERE ra.figurinha_id IN (
             SELECT fb.figurinha_id FROM public.faltantes fb WHERE fb.user_id = u.id
           )),
          '[]'::jsonb
        ) AS a_oferece,
        -- Figurinhas que B pode dar para A (rep B ∩ falt A)
        COALESCE(
          (SELECT jsonb_agg(jsonb_build_object('figurinha_id', rb.figurinha_id, 'qtd', rb.quantidade))
           FROM public.repetidas rb
           WHERE rb.user_id = u.id
             AND rb.figurinha_id IN (SELECT figurinha_id FROM falt_a)),
          '[]'::jsonb
        ) AS b_oferece
      FROM public.usuarios u
      WHERE u.id IN (SELECT user_id FROM candidatos)
        AND u.banido = false
        AND (NOT p_mesma_cidade_only OR u.cidade = v_cidade)
    )
  SELECT
    m.user_b_id,
    m.nome,
    m.cidade,
    m.bairro,
    m.estado,
    m.foto_url,
    m.reputacao,
    m.plano,
    m.verificado,
    LEAST(
      jsonb_array_length(m.a_oferece),
      jsonb_array_length(m.b_oferece)
    )::INT AS trocas_possiveis,
    m.a_oferece,
    m.b_oferece,
    (
      LEAST(jsonb_array_length(m.a_oferece), jsonb_array_length(m.b_oferece))::DECIMAL * 5
      + CASE WHEN m.bairro = v_bairro AND m.bairro IS NOT NULL THEN 5 ELSE 0 END
      + CASE WHEN m.cidade = v_cidade THEN 3 ELSE 0 END
      + CASE WHEN m.estado = v_estado THEN 1 ELSE 0 END
      + CASE WHEN m.ultimo_acesso > now() - INTERVAL '7 days' THEN 2 ELSE 0 END
      + COALESCE(m.reputacao, 0) * 0.5
      + CASE WHEN m.verificado THEN 2 ELSE 0 END
      + CASE WHEN m.plano IN ('premium','plus') THEN 1 ELSE 0 END
      + CASE WHEN m.destaque_ate > now() THEN 1 ELSE 0 END
    )::DECIMAL AS score
  FROM matches m
  WHERE jsonb_array_length(m.a_oferece) > 0
    AND jsonb_array_length(m.b_oferece) > 0
  ORDER BY score DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================================
-- VIEW: progresso do usuário em uma coleção
-- =====================================================================
CREATE OR REPLACE VIEW public.progresso_colecao AS
SELECT
  u.id AS user_id,
  c.id AS colecao_id,
  c.slug,
  c.total_figurinhas,
  (SELECT COUNT(DISTINCT r.figurinha_id)
   FROM public.repetidas r JOIN public.figurinhas f ON f.id = r.figurinha_id
   WHERE r.user_id = u.id AND f.colecao_id = c.id) AS tenho_unicas,
  (SELECT COUNT(*)
   FROM public.faltantes fa JOIN public.figurinhas f ON f.id = fa.figurinha_id
   WHERE fa.user_id = u.id AND f.colecao_id = c.id) AS faltam
FROM public.usuarios u CROSS JOIN public.colecoes c;
