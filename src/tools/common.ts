import * as z from "zod/v4";

export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

export const CHARACTER_LIMIT = 25_000;

export const formatField = z
  .enum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("'markdown' para leitura, 'json' para dados estruturados");

export const wabaIdField = z
  .string()
  .regex(/^\d{5,20}$/, "Use só os dígitos do WABA ID")
  .optional()
  .describe("WABA ID da API (o da URL de Configurações do negócio → Contas do WhatsApp). Se omitido, usa META_WABA_ID.");

export const phoneIdField = z
  .string()
  .regex(/^\d{5,20}$/, "Use só os dígitos do Phone Number ID")
  .optional()
  .describe("Phone Number ID (não é o telefone). Se omitido, usa META_PHONE_NUMBER_ID.");

export function resolveWaba(value: string | undefined): string {
  const id = value ?? process.env.META_WABA_ID;
  if (!id) {
    throw new Error("Informe waba_id ou defina META_WABA_ID. Não sabe qual é? Rode wa_discover_ids: ele lista as contas que o token enxerga.");
  }
  return id;
}

export function resolvePhone(value: string | undefined): string {
  const id = value ?? process.env.META_PHONE_NUMBER_ID;
  if (!id) {
    throw new Error("Informe phone_number_id ou defina META_PHONE_NUMBER_ID. Rode wa_discover_ids ou wa_list_phone_numbers para descobrir.");
  }
  return id;
}

export function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

/** JSON: dados em structuredContent + o mesmo JSON como texto; Markdown: só o texto. */
export function formatted(format: ResponseFormat, data: Record<string, unknown>, markdown: string) {
  if (format === ResponseFormat.JSON) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data };
  }
  return textResult(markdown);
}

export function clip(text: string): string {
  return text.length <= CHARACTER_LIMIT ? text : `${text.slice(0, CHARACTER_LIMIT)}\n\n_(resposta cortada em ${CHARACTER_LIMIT} caracteres)_`;
}

export const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;
export const LOCAL_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;
