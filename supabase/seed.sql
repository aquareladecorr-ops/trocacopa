-- =====================================================================
-- TrocaCromos - Dados iniciais (seed) - VERSÃO ATUALIZADA
-- Execute APÓS schema.sql e policies.sql
-- Mundial 2026: 980 figurinhas (912 couché + 68 metalizadas especiais)
--   - 20 figurinhas de introdução FWC (logos, troféu, sedes, estádios)
--   - 48 seleções × 20 figurinhas = 960 figurinhas
--     * 1 escudo (metalizado/especial) por seleção
--     * 1 foto do time (rara) por seleção
--     * 18 jogadores (comum/rara) por seleção
-- Fonte: Álbum oficial Panini FIFA World Cup 2026
-- =====================================================================

-- ============== COLEÇÕES ==============
INSERT INTO public.colecoes (slug, nome, ano, categoria, total_figurinhas, descricao, ativa)
VALUES
('mundial-2026', 'Mundial 2026', 2026, 'futebol', 980,
'Coleção oficial Panini do álbum do Mundial FIFA 2026 — 48 seleções, 980 figurinhas (912 couché + 68 metalizadas especiais)', true),
('brasileirao-2026', 'Brasileirão 2026', 2026, 'futebol', 400,
'Coleção do Campeonato Brasileiro Série A 2026', true),
('pokemon-tcg-base', 'Pokémon TCG - Base', 2025, 'tcg', 200,
'Card game Pokémon — set base', true)
ON CONFLICT (slug) DO UPDATE SET
  total_figurinhas = EXCLUDED.total_figurinhas,
  descricao = EXCLUDED.descricao;

-- ============== FIGURINHAS - MUNDIAL 2026 ==============
DO $$
DECLARE
  v_colecao_id UUID;
  v_num INT := 21;
  teams TEXT[][] := ARRAY[
    ARRAY['QAT', 'Qatar', 'A'],
    ARRAY['ECU', 'Equador', 'A'],
    ARRAY['SEN', 'Senegal', 'A'],
    ARRAY['NED', 'Holanda', 'A'],
    ARRAY['ENG', 'Inglaterra', 'B'],
    ARRAY['IRI', 'Irã', 'B'],
    ARRAY['USA', 'Estados Unidos', 'B'],
    ARRAY['WAL', 'País de Gales', 'B'],
    ARRAY['ARG', 'Argentina', 'C'],
    ARRAY['SAU', 'Arábia Saudita', 'C'],
    ARRAY['MEX', 'México', 'C'],
    ARRAY['POL', 'Polônia', 'C'],
    ARRAY['FRA', 'França', 'D'],
    ARRAY['AUS', 'Austrália', 'D'],
    ARRAY['DEN', 'Dinamarca', 'D'],
    ARRAY['TUN', 'Tunísia', 'D'],
    ARRAY['ESP', 'Espanha', 'E'],
    ARRAY['CRC', 'Costa Rica', 'E'],
    ARRAY['GER', 'Alemanha', 'E'],
    ARRAY['JPN', 'Japão', 'E'],
    ARRAY['BEL', 'Bélgica', 'F'],
    ARRAY['CAN', 'Canadá', 'F'],
    ARRAY['MAR', 'Marrocos', 'F'],
    ARRAY['CRO', 'Croácia', 'F'],
    ARRAY['BRA', 'Brasil', 'G'],
    ARRAY['SRB', 'Sérvia', 'G'],
    ARRAY['SUI', 'Suíça', 'G'],
    ARRAY['CMR', 'Camarões', 'G'],
    ARRAY['POR', 'Portugal', 'H'],
    ARRAY['GHA', 'Gana', 'H'],
    ARRAY['URU', 'Uruguai', 'H'],
    ARRAY['KOR', 'Coreia do Sul', 'H'],
    ARRAY['NZL', 'Nova Zelândia', 'I'],
    ARRAY['NOR', 'Noruega', 'I'],
    ARRAY['COL', 'Colômbia', 'I'],
    ARRAY['PAN', 'Panamá', 'I'],
    ARRAY['RSA', 'África do Sul', 'J'],
    ARRAY['EGY', 'Egito', 'J'],
    ARRAY['NGA', 'Nigéria', 'J'],
    ARRAY['MLI', 'Mali', 'J'],
    ARRAY['SAL', 'El Salvador', 'K'],
    ARRAY['HND', 'Honduras', 'K'],
    ARRAY['VEN', 'Venezuela', 'K'],
    ARRAY['IRQ', 'Iraque', 'K'],
    ARRAY['ITA', 'Itália', 'L'],
    ARRAY['ALB', 'Albânia', 'L'],
    ARRAY['CZE', 'República Checa', 'L'],
    ARRAY['UKR', 'Ucrânia', 'L']
  ];
  t TEXT[];
  i INT;
  prefix TEXT;
  team_name TEXT;
  group_name TEXT;
BEGIN
  SELECT id INTO v_colecao_id FROM public.colecoes WHERE slug = 'mundial-2026';
  IF v_colecao_id IS NULL THEN RETURN; END IF;

  DELETE FROM public.figurinhas WHERE colecao_id = v_colecao_id;

  INSERT INTO public.figurinhas (colecao_id, codigo, numero, nome, raridade, tipo) VALUES
    (v_colecao_id, 'FWC001', 1,  'Logo FIFA World Cup 2026', 'especial', 'logo'),
    (v_colecao_id, 'FWC002', 2,  'Troféu FIFA', 'especial', 'logo'),
    (v_colecao_id, 'FWC003', 3,  'Bola Oficial', 'especial', 'logo'),
    (v_colecao_id, 'FWC004', 4,  'Logo Panini', 'especial', 'logo'),
    (v_colecao_id, 'FWC005', 5,  'Estados Unidos - País Sede', 'especial', 'estadio'),
    (v_colecao_id, 'FWC006', 6,  'Canadá - País Sede', 'especial', 'estadio'),
    (v_colecao_id, 'FWC007', 7,  'México - País Sede', 'especial', 'estadio'),
    (v_colecao_id, 'FWC008', 8,  'MetLife Stadium - Nova York', 'especial', 'estadio'),
    (v_colecao_id, 'FWC009', 9,  'Rose Bowl - Los Angeles', 'especial', 'estadio'),
    (v_colecao_id, 'FWC010', 10, 'AT&T Stadium - Dallas', 'especial', 'estadio'),
    (v_colecao_id, 'FWC011', 11, 'Lumen Field - Seattle', 'especial', 'estadio'),
    (v_colecao_id, 'FWC012', 12, 'Arrowhead Stadium - Kansas City', 'especial', 'estadio'),
    (v_colecao_id, 'FWC013', 13, 'Lincoln Financial Field - Filadélfia', 'especial', 'estadio'),
    (v_colecao_id, 'FWC014', 14, 'Gillette Stadium - Boston', 'especial', 'estadio'),
    (v_colecao_id, 'FWC015', 15, 'NRG Stadium - Houston', 'especial', 'estadio'),
    (v_colecao_id, 'FWC016', 16, 'BC Place - Vancouver', 'especial', 'estadio'),
    (v_colecao_id, 'FWC017', 17, 'Estadio Azteca - Cidade do México', 'especial', 'estadio'),
    (v_colecao_id, 'FWC018', 18, 'Estadio Akron - Guadalajara', 'especial', 'estadio'),
    (v_colecao_id, 'FWC019', 19, 'Mapa dos Grupos - Copa 2026', 'especial', 'logo'),
    (v_colecao_id, 'FWC020', 20, 'Mascote Oficial FIFA 2026', 'especial', 'logo');

  FOREACH t SLICE 1 IN ARRAY teams LOOP
    prefix     := t[1];
    team_name  := t[2];
    group_name := t[3];

    INSERT INTO public.figurinhas (colecao_id, codigo, numero, nome, raridade, tipo)
    VALUES (v_colecao_id, prefix || '1', v_num, team_name || ' - Escudo', 'especial', 'escudo');
    v_num := v_num + 1;

    INSERT INTO public.figurinhas (colecao_id, codigo, numero, nome, raridade, tipo)
    VALUES (v_colecao_id, prefix || '2', v_num, team_name || ' - Foto do Time', 'rara', 'jogador');
    v_num := v_num + 1;

    FOR i IN 3..20 LOOP
      INSERT INTO public.figurinhas (colecao_id, codigo, numero, nome, raridade, tipo)
      VALUES (
        v_colecao_id,
        prefix || i::TEXT,
        v_num,
        team_name || ' - Jogador ' || (i-2)::TEXT,
        CASE WHEN i = 3 THEN 'rara' ELSE 'comum' END,
        'jogador'
      );
      v_num := v_num + 1;
    END LOOP;
  END LOOP;
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
