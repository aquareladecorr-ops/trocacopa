-- Migration: Add missing columns to usuarios table
-- Execute no SQL Editor do Supabase em: supabase.com/dashboard/project/clhuuqcbbuunxeeidims/sql/new

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS estado CHAR(2);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS uf CHAR(2);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS lat DECIMAL(9,6);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS lng DECIMAL(9,6);
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS whatsapp_oculto BOOLEAN DEFAULT true;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS contato_preferido TEXT DEFAULT 'chat_interno';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS forma_troca TEXT DEFAULT 'ambos';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'free';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS plano_ate TIMESTAMPTZ;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS destaque_ate TIMESTAMPTZ;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cromo_coins INT DEFAULT 0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS verificado_em TIMESTAMPTZ;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS reputacao DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS trocas_concluidas INT DEFAULT 0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS banido BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS banido_motivo TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS preferencia_notificacao JSONB DEFAULT '{}';
