-- =====================================================================
-- TrocaCromos - Dados iniciais (seed)
-- Execute APÓS schema.sql e policies.sql
-- Cria 2 coleções: Mundial 2026 (670 cromos) e Brasileirão 2026 (400 cromos)
-- =====================================================================

-- ============== COLEÇÕES ==============
INSERT INTO public.colecoes (slug, nome, ano, categoria, total_figurinhas, descricao, ativa)
VALUES
  ('mundial-2026', 'Mundial 2026', 2026, 'futebol', 670,
   'Coleção do álbum do Mundial de Futebol 2026', true),
  ('brasileirao-2026', 'Brasileirão 2026', 2026, 'futebol', 400,
   'Coleção do Campeonato Brasileiro Série A 2026', true),
  ('pokemon-tcg-base', 'Pokémon TCG - Base', 2025, 'tcg', 200,
   'Card game Pokémon — set base', true)
ON CONFLICT (slug) DO NOTHING;

-- ============== FIGURINHAS - MUNDIAL 2026 ==============
DO $$
DECLARE
  v_colecao_id UUID;
  i INT;
BEGIN
  SELECT id INTO v_colecao_id FROM public.colecoes WHERE slug = 'mundial-2026';

  IF v_colecao_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.figurinhas WHERE colecao_id = v_colecao_id
  ) THEN
    FOR i IN 1..670 LOOP
      INSERT INTO public.figurinhas (colecao_id, codigo, numero, nome, raridade, tipo)
      VALUES (
        v_colecao_id,
        LPAD(i::TEXT, 3, '0'),
        i,
        'Figurinha #' || LPAD(i::TEXT, 3, '0'),
        CASE
          WHEN i % 100 = 0 THEN 'legend'
          WHEN i % 25 = 0  THEN 'especial'
          WHEN i % 10 = 0  THEN 'rara'
          ELSE 'comum'
        END,
        CASE
          WHEN i % 32 = 1 THEN 'escudo'
          WHEN i % 100 = 0 THEN 'legend'
          ELSE 'jogador'
        END
      );
    END LOOP;
  END IF;
END $$;

-- ============== FIGURINHAS - BRASILEIRÃO 2026 ==============
DO $$
DECLARE
  v_colecao_id UUID;
  i INT;
BEGIN
  SELECT id INTO v_colecao_id FROM public.colecoes WHERE slug = 'brasileirao-2026';

  IF v_colecao_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.figurinhas WHERE colecao_id = v_colecao_id
  ) THEN
    FOR i IN 1..400 LOOP
      INSERT INTO public.figurinhas (colecao_id, codigo, numero, nome, raridade, tipo)
      VALUES (
        v_colecao_id,
        LPAD(i::TEXT, 3, '0'),
        i,
        'Cromo #' || LPAD(i::TEXT, 3, '0'),
        CASE
          WHEN i % 50 = 0 THEN 'especial'
          WHEN i % 10 = 0 THEN 'rara'
          ELSE 'comum'
        END,
        'jogador'
      );
    END LOOP;
  END IF;
END $$;

-- ============== FIGURINHAS - POKÉMON TCG ==============
DO $$
DECLARE
  v_colecao_id UUID;
  i INT;
BEGIN
  SELECT id INTO v_colecao_id FROM public.colecoes WHERE slug = 'pokemon-tcg-base';

  IF v_colecao_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.figurinhas WHERE colecao_id = v_colecao_id
  ) THEN
    FOR i IN 1..200 LOOP
      INSERT INTO public.figurinhas (colecao_id, codigo, numero, nome, raridade, tipo)
      VALUES (
        v_colecao_id,
        LPAD(i::TEXT, 3, '0'),
        i,
        'Card #' || LPAD(i::TEXT, 3, '0'),
        CASE
          WHEN i % 30 = 0 THEN 'legend'
          WHEN i % 10 = 0 THEN 'rara'
          ELSE 'comum'
        END,
        'card'
      );
    END LOOP;
  END IF;
END $$;
