// Detector simples de padrões suspeitos em mensagens de chat.
// Em produção, evoluir para ML + listas dinâmicas.

const SUSPICIOUS_PATTERNS = [
  // Pedidos de pagamento
  /\bpix\b/i,
  /\bchave\s+pix\b/i,
  /\bcomprovante\b/i,
  /\btransfer[êe]ncia\b/i,
  /\bdeposit[ao]\b/i,
  // Engenharia social
  /\bsenha\b/i,
  /\bcart[ãa]o\s+de\s+cr[ée]dito\b/i,
  /\bcpf\b.*\d/i,
  /\bc[óo]digo\s+(do\s+)?banco\b/i,
  // Links externos suspeitos
  /(bit\.ly|tinyurl|encurtador|short\.io)/i,
  // Pagamento explícito
  /\bpago\s+r\$/i,
  /\bvendo\s+por\b/i,
];

export interface AntiFraudResult {
  flagged: boolean;
  matches: string[];
  warningMessage?: string;
}

export function checkAntiFraud(message: string): AntiFraudResult {
  const matches: string[] = [];
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(message)) matches.push(pattern.source);
  }
  if (matches.length === 0) return { flagged: false, matches: [] };
  return {
    flagged: true,
    matches,
    warningMessage:
      'Cuidado: nossa plataforma é exclusivamente para TROCAS. Nunca envie dinheiro, Pix, comprovantes ou dados sensíveis. Em caso de venda, reporte ao admin.',
  };
}
