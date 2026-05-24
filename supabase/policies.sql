-- =====================================================================
-- TrocaCromos - Row Level Security (RLS)
-- Execute APÓS schema.sql
-- =====================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colecoes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figurinhas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repetidas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faltantes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acordos_troca  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anuncios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupo_membros  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_rsvps   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes   ENABLE ROW LEVEL SECURITY;

-- ============== USUÁRIOS ==============
DROP POLICY IF EXISTS "usuarios_select_publico" ON public.usuarios;
CREATE POLICY "usuarios_select_publico" ON public.usuarios
  FOR SELECT USING (NOT banido);

DROP POLICY IF EXISTS "usuarios_update_proprio" ON public.usuarios;
CREATE POLICY "usuarios_update_proprio" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- ============== COLEÇÕES / FIGURINHAS (público) ==============
DROP POLICY IF EXISTS "colecoes_select_all" ON public.colecoes;
CREATE POLICY "colecoes_select_all" ON public.colecoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "figurinhas_select_all" ON public.figurinhas;
CREATE POLICY "figurinhas_select_all" ON public.figurinhas FOR SELECT USING (true);

-- ============== REPETIDAS / FALTANTES ==============
DROP POLICY IF EXISTS "repetidas_select" ON public.repetidas;
CREATE POLICY "repetidas_select" ON public.repetidas FOR SELECT USING (true);

DROP POLICY IF EXISTS "repetidas_modify_proprio" ON public.repetidas;
CREATE POLICY "repetidas_modify_proprio" ON public.repetidas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "faltantes_select" ON public.faltantes;
CREATE POLICY "faltantes_select" ON public.faltantes FOR SELECT USING (true);

DROP POLICY IF EXISTS "faltantes_modify_proprio" ON public.faltantes;
CREATE POLICY "faltantes_modify_proprio" ON public.faltantes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============== PROPOSTAS ==============
DROP POLICY IF EXISTS "propostas_select_envolvido" ON public.propostas;
CREATE POLICY "propostas_select_envolvido" ON public.propostas
  FOR SELECT USING (auth.uid() = remetente_id OR auth.uid() = destinatario_id);

DROP POLICY IF EXISTS "propostas_insert" ON public.propostas;
CREATE POLICY "propostas_insert" ON public.propostas
  FOR INSERT WITH CHECK (auth.uid() = remetente_id);

DROP POLICY IF EXISTS "propostas_update_envolvido" ON public.propostas;
CREATE POLICY "propostas_update_envolvido" ON public.propostas
  FOR UPDATE USING (auth.uid() = remetente_id OR auth.uid() = destinatario_id);

-- ============== ACORDOS ==============
DROP POLICY IF EXISTS "acordos_select_envolvido" ON public.acordos_troca;
CREATE POLICY "acordos_select_envolvido" ON public.acordos_troca
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

DROP POLICY IF EXISTS "acordos_update_envolvido" ON public.acordos_troca;
CREATE POLICY "acordos_update_envolvido" ON public.acordos_troca
  FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);

-- ============== CONVERSAS ==============
DROP POLICY IF EXISTS "conversas_select_participante" ON public.conversas;
CREATE POLICY "conversas_select_participante" ON public.conversas
  FOR SELECT USING (auth.uid() = participante_a OR auth.uid() = participante_b);

DROP POLICY IF EXISTS "conversas_insert" ON public.conversas;
CREATE POLICY "conversas_insert" ON public.conversas
  FOR INSERT WITH CHECK (auth.uid() = participante_a OR auth.uid() = participante_b);

-- ============== MENSAGENS ==============
DROP POLICY IF EXISTS "mensagens_select_participante" ON public.mensagens;
CREATE POLICY "mensagens_select_participante" ON public.mensagens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversas c
      WHERE c.id = mensagens.conversa_id
        AND (c.participante_a = auth.uid() OR c.participante_b = auth.uid())
    )
  );

DROP POLICY IF EXISTS "mensagens_insert_participante" ON public.mensagens;
CREATE POLICY "mensagens_insert_participante" ON public.mensagens
  FOR INSERT WITH CHECK (
    auth.uid() = remetente_id AND EXISTS (
      SELECT 1 FROM public.conversas c
      WHERE c.id = conversa_id
        AND (c.participante_a = auth.uid() OR c.participante_b = auth.uid())
    )
  );

-- ============== AVALIAÇÕES ==============
DROP POLICY IF EXISTS "avaliacoes_select" ON public.avaliacoes;
CREATE POLICY "avaliacoes_select" ON public.avaliacoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "avaliacoes_insert" ON public.avaliacoes;
CREATE POLICY "avaliacoes_insert" ON public.avaliacoes
  FOR INSERT WITH CHECK (auth.uid() = avaliador_id);

-- ============== DENÚNCIAS ==============
DROP POLICY IF EXISTS "denuncias_insert" ON public.denuncias;
CREATE POLICY "denuncias_insert" ON public.denuncias
  FOR INSERT WITH CHECK (auth.uid() = denunciante_id);

DROP POLICY IF EXISTS "denuncias_select_propria" ON public.denuncias;
CREATE POLICY "denuncias_select_propria" ON public.denuncias
  FOR SELECT USING (auth.uid() = denunciante_id);

-- ============== PAGAMENTOS ==============
DROP POLICY IF EXISTS "pagamentos_select_proprio" ON public.pagamentos;
CREATE POLICY "pagamentos_select_proprio" ON public.pagamentos
  FOR SELECT USING (auth.uid() = user_id);

-- ============== ANÚNCIOS (público) ==============
DROP POLICY IF EXISTS "anuncios_select_ativos" ON public.anuncios;
CREATE POLICY "anuncios_select_ativos" ON public.anuncios
  FOR SELECT USING (ativo AND aprovado);

-- ============== COMUNIDADE ==============
DROP POLICY IF EXISTS "grupos_select_all" ON public.grupos;
CREATE POLICY "grupos_select_all" ON public.grupos FOR SELECT USING (true);

DROP POLICY IF EXISTS "eventos_select_all" ON public.eventos;
CREATE POLICY "eventos_select_all" ON public.eventos FOR SELECT USING (true);

DROP POLICY IF EXISTS "rsvp_select" ON public.evento_rsvps;
CREATE POLICY "rsvp_select" ON public.evento_rsvps FOR SELECT USING (true);

DROP POLICY IF EXISTS "rsvp_modify_proprio" ON public.evento_rsvps;
CREATE POLICY "rsvp_modify_proprio" ON public.evento_rsvps
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============== NOTIFICAÇÕES ==============
DROP POLICY IF EXISTS "notificacoes_select_proprio" ON public.notificacoes;
CREATE POLICY "notificacoes_select_proprio" ON public.notificacoes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notificacoes_update_proprio" ON public.notificacoes;
CREATE POLICY "notificacoes_update_proprio" ON public.notificacoes
  FOR UPDATE USING (auth.uid() = user_id);
