export type Plano = 'free' | 'premium' | 'plus';
export type FormaTroca = 'presencial' | 'envio' | 'ambos';
export type Raridade = 'comum' | 'rara' | 'legend' | 'especial';
export type StatusProposta = 'pendente' | 'aceita' | 'rejeitada' | 'contraproposta' | 'expirada' | 'cancelada';
export type StatusAcordo = 'aceito' | 'em_andamento' | 'concluido' | 'disputado' | 'cancelado';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cidade: string | null;
  bairro: string | null;
  estado: string | null;
  whatsapp: string | null;
  whatsapp_oculto: boolean;
  instagram: string | null;
  bio: string | null;
  foto_url: string | null;
  contato_preferido: 'whatsapp' | 'chat_interno' | 'email';
  forma_troca: FormaTroca;
  plano: Plano;
  plano_ate: string | null;
  destaque_ate: string | null;
  cromo_coins: number;
  verificado: boolean;
  reputacao: number;
  trocas_concluidas: number;
  banido: boolean;
  is_admin: boolean;
  onboarding_completo: boolean;
  ultimo_acesso: string;
  criado_em: string;
}

export interface Colecao {
  id: string;
  slug: string;
  nome: string;
  ano: number | null;
  categoria: string | null;
  total_figurinhas: number;
  ativa: boolean;
  cover_url: string | null;
  descricao: string | null;
}

export interface Figurinha {
  id: string;
  colecao_id: string;
  codigo: string;
  numero: number;
  nome: string | null;
  categoria: string | null;
  tipo: string | null;
  raridade: Raridade;
}

export interface ItemTroca { figurinha_id: string; qtd: number; }

export interface MatchRow {
  user_b_id: string;
  user_b_nome: string;
  user_b_cidade: string | null;
  user_b_bairro: string | null;
  user_b_estado: string | null;
  user_b_foto_url: string | null;
  user_b_reputacao: number;
  user_b_plano: Plano;
  user_b_verificado: boolean;
  trocas_possiveis: number;
  a_oferece: ItemTroca[];
  b_oferece: ItemTroca[];
  score: number;
}

export interface Proposta {
  id: string;
  remetente_id: string;
  destinatario_id: string;
  colecao_id: string | null;
  oferta: ItemTroca[];
  pedido: ItemTroca[];
  status: StatusProposta;
  mensagem: string | null;
  forma_troca: FormaTroca | null;
  expira_em: string;
  criado_em: string;
}

export interface Mensagem {
  id: string;
  conversa_id: string;
  remetente_id: string;
  conteudo: string;
  tipo: 'texto' | 'imagem' | 'sistema' | 'codigo_rastreio';
  anexo_url: string | null;
  flagged_antifraude: boolean;
  lida_em: string | null;
  criado_em: string;
}

export interface Conversa {
  id: string;
  participante_a: string;
  participante_b: string;
  acordo_id: string | null;
  proposta_id: string | null;
  ultima_msg_em: string | null;
  ultima_msg_preview: string | null;
  arquivada: boolean;
  criado_em: string;
}
