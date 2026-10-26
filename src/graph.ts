import { hintForGraphError } from "./knowledge/render.js";

export const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const GRAPH_BASE = "https://graph.facebook.com";
const TIMEOUT_MS = 30_000;

export class GraphError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: number
  ) {
    super(message);
  }
}

export function requireToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "META_ACCESS_TOKEN não está definido. Coloque o token de Usuário do Sistema na variável de ambiente META_ACCESS_TOKEN da configuração deste MCP (você cola; o agente não digita segredos). Como gerar: wa_guide_get_phase com id 'usuario-sistema-token'."
    );
  }
  return token;
}

function redact(text: string): string {
  const token = process.env.META_ACCESS_TOKEN;
  const secret = process.env.META_APP_SECRET;
  let result = text;
  for (const value of [token, secret]) if (value) result = result.split(value).join("[oculto]");
  return result;
}

interface GraphErrorBody {
  error?: { message?: string; code?: number; error_subcode?: number; error_user_msg?: string; error_user_title?: string };
}

/** Token de app (APP_ID|APP_SECRET), exigido por /{app_id}/subscriptions. */
export function requireAppToken(): string {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error(
      "Esta consulta exige META_APP_ID e META_APP_SECRET na configuração do MCP (você cola; o agente não digita segredos). Sem eles, confira o callback no painel do app: WhatsApp → Configuração → Webhook."
    );
  }
  return `${appId}|${appSecret}`;
}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  params: Record<string, string | number | undefined>,
  body: unknown,
  signal: AbortSignal,
  authToken?: string
): Promise<T> {
  const token = authToken ?? requireToken();
  const url = new URL(`${GRAPH_BASE}/${GRAPH_VERSION}/${path.replace(/^\//, "")}`);
  for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)])
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("A Graph API não respondeu em 30 segundos. Tente de novo.");
    }
    throw error;
  }

  const data = (await response.json().catch(() => ({}))) as GraphErrorBody & T;
  if (!response.ok) {
    const info = data.error;
    const detail = info?.error_user_msg ?? info?.message ?? `HTTP ${response.status}`;
    const hint = hintForGraphError(info?.code, `${info?.message ?? ""} ${info?.error_user_msg ?? ""}`);
    const message = redact(`Graph API${info?.code ? ` (#${info.code})` : ""}: ${detail}${hint ? `\n→ ${hint}` : ""}`);
    throw new GraphError(message, response.status, info?.code);
  }
  return data;
}

export function graphGet<T>(path: string, params: Record<string, string | number | undefined>, signal: AbortSignal, authToken?: string): Promise<T> {
  return request<T>("GET", path, params, undefined, signal, authToken);
}

export function graphPost<T>(path: string, body: unknown, signal: AbortSignal): Promise<T> {
  return request<T>("POST", path, {}, body, signal);
}

/**
 * Tenta cada lista de campos, da mais completa à mais enxuta, até a Graph API
 * aceitar (erro #100 costuma ser só um campo que a conta não expõe).
 */
export async function graphGetFields<T>(path: string, fieldSets: string[], extra: Record<string, string | number | undefined>, signal: AbortSignal): Promise<T> {
  let lastError: unknown;
  for (const fields of fieldSets) {
    try {
      return await graphGet<T>(path, { ...extra, fields }, signal);
    } catch (error) {
      lastError = error;
      if (!(error instanceof GraphError) || error.code !== 100) throw error;
    }
  }
  throw lastError;
}
