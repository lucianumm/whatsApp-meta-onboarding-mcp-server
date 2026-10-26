export type Who = "voce" | "automatico" | "ambos";

/** Vocabulário fechado de tags: cada fase e cada erro usa só estas. */
export const TAGS = {
  "cloud-api": "API oficial hospedada pela Meta (registro padrão)",
  "numero-virtual": "Número fornecido pelo próprio WhatsApp / criado direto na Meta",
  coexistencia: "Mesmo número no app WhatsApp Business e na Cloud API",
  portfolio: "Portfólio empresarial e Verificação da empresa",
  app: "App no Meta for Developers",
  waba: "Conta do WhatsApp Business e número",
  ids: "WABA ID, Phone Number ID, IDs que confundem",
  token: "Usuário do Sistema, token e permissões",
  webhook: "Recebimento de mensagens e status",
  faturamento: "Moeda, forma de pagamento e cobrança",
  templates: "Modelos de mensagem",
  envio: "Envio, entrega e erros de entrega",
  suporte: "Como (e onde) pedir ajuda à Meta",
  seguranca: "Segredos, permissões mínimas, ações irreversíveis",
  irreversivel: "Ação que não dá para desfazer"
} as const;

export type Tag = keyof typeof TAGS;

export interface Step {
  who: Who;
  text: string;
}

export interface Pitfall {
  /** O que se vê na tela ou na API. */
  symptom: string;
  cause: string;
  fix: string;
  /** true = aconteceu de verdade em implantações reais; false = vem da documentação pública da Meta. */
  lived: boolean;
}

export interface Phase {
  id: string;
  order: number;
  title: string;
  goal: string;
  tags: Tag[];
  steps: Step[];
  /** Como saber que a fase terminou. `tool` aponta a ferramenta deste MCP que confere. */
  checks: { text: string; tool?: string }[];
  pitfalls: Pitfall[];
  next?: string;
}

export interface ErrorEntry {
  /** Código numérico da Graph API, quando existe. */
  code?: number;
  /** Textos que aparecem na tela / na resposta e ajudam a achar a entrada. */
  keywords: string[];
  title: string;
  meaning: string;
  action: string;
  lived: boolean;
  tags: Tag[];
  phase?: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}
