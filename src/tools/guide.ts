import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { ERRORS } from "../knowledge/errors.js";
import { getPhase, PHASES } from "../knowledge/phases.js";
import { findErrors, renderError, renderGlossary, renderOverview, renderPhase, renderTagIndex, renderTags, searchKnowledge, TAG_NAMES } from "../knowledge/render.js";
import { clip, LOCAL_ONLY, textResult } from "./common.js";

const phaseIds = PHASES.map(phase => phase.id);

export function registerGuideTools(server: McpServer): void {
  server.registerTool(
    "wa_guide_overview",
    {
      title: "Visão geral do caminho",
      description: `Mostra o caminho completo para ter um número (inclusive virtual) na API oficial do WhatsApp da Meta: as ${PHASES.length} fases em ordem, quem faz cada coisa (você / automático / juntos) e o que o agente nunca faz.

Use no início de qualquer conversa sobre "conectar número", "disparos pela API oficial" ou "número virtual". Depois aprofunde com wa_guide_get_phase. Não acessa a rede.`,
      inputSchema: z.strictObject({}),
      annotations: LOCAL_ONLY
    },
    async () => textResult(renderOverview())
  );

  server.registerTool(
    "wa_guide_get_phase",
    {
      title: "Detalhar uma fase",
      description: `Devolve uma fase do caminho: passos (marcados VOCÊ / AUTOMÁTICO / JUNTOS), como saber que terminou e as armadilhas reais (sintoma → causa → o que fazer).

Fases (id): ${phaseIds.join(", ")}.

Exemplos:
  - "Como crio o token permanente?" -> phase_id="usuario-sistema-token"
  - "Qual ID é o WABA ID?" -> phase_id="ids"
  - "Vale a pena tentar coexistência?" -> phase_id="coexistencia"`,
      inputSchema: z.strictObject({
        phase_id: z.enum(phaseIds as [string, ...string[]]).describe("Identificador da fase")
      }),
      annotations: LOCAL_ONLY
    },
    async ({ phase_id }) => {
      const phase = getPhase(phase_id);
      if (!phase) return textResult(`Fase '${phase_id}' não existe. Use uma destas: ${phaseIds.join(", ")}.`);
      return textResult(renderPhase(phase));
    }
  );

  server.registerTool(
    "wa_explain_error",
    {
      title: "Explicar um erro",
      description: `Traduz um erro da Meta/WhatsApp (código ou texto da tela) em significado, causa e o que fazer, apontando a fase do caminho relacionada. Cobre ${ERRORS.length} erros: os vividos na prática (131037, 131042, 141006, #3441034, #2200, #200, #100, 'Conta com restrição'…) e os mais comuns da documentação pública (131047, 131030, 132001…).

Exemplos:
  - "Deu 131037 no envio" -> query="131037"
  - "A tela diz Conta com restrição" -> query="conta com restrição"
Retorna vazio com sugestões se nada bater.`,
      inputSchema: z.strictObject({
        query: z.string().min(2).max(300).describe("Código (ex.: 131042) ou trecho da mensagem de erro")
      }),
      annotations: LOCAL_ONLY
    },
    async ({ query }) => {
      const hits = findErrors(query).slice(0, 5);
      if (hits.length === 0) {
        return textResult(
          `Nada no catálogo para "${query}". Tente só o número do erro ou uma frase curta da mensagem. Se for um erro novo, veja o campo 'errors' no corpo do webhook de status (é lá que está o erro real de entrega) e a fase 'primeiro-envio'.`
        );
      }
      return textResult(hits.map(renderError).join("\n\n"));
    }
  );

  server.registerTool(
    "wa_guide_search",
    {
      title: "Buscar no guia (texto ou tag)",
      description: `Busca em todos os passos, armadilhas e erros do guia, por texto (todas as palavras precisam aparecer, sem acento/caixa) e/ou por tag. Sem query e sem tag, devolve o índice de tags com as fases e erros de cada uma.

Tags: ${TAG_NAMES.map(tag => `#${tag}`).join(", ")}.

Exemplos:
  - "Onde fica o Phone Number ID?" -> query="phone number id"
  - "Tudo de coexistência" -> tag="coexistencia"
  - "O que é irreversível?" -> tag="irreversivel"`,
      inputSchema: z.strictObject({
        query: z.string().min(2).max(200).optional().describe("Palavras a procurar"),
        tag: z.enum(TAG_NAMES as [string, ...string[]]).optional().describe("Filtrar por tag (sem o #)")
      }),
      annotations: LOCAL_ONLY
    },
    async ({ query, tag }) => {
      if (!query && !tag) return textResult(renderTagIndex());
      const hits = searchKnowledge(query, tag as (typeof TAG_NAMES)[number] | undefined);
      if (hits.length === 0) {
        return textResult(`Nada encontrado${query ? ` para "${query}"` : ""}${tag ? ` na tag #${tag}` : ""}. Tente menos palavras, outra tag, ou wa_guide_overview.`);
      }
      const lines = [`# ${hits.length} resultado(s)`, ""];
      for (const hit of hits) {
        lines.push(`- **${hit.kind}** · ${hit.phase ? `fase \`${hit.phase}\`` : "sem fase"} · ${renderTags(hit.tags)}`, `  ${hit.text}`);
      }
      return textResult(clip(lines.join("\n")));
    }
  );

  server.registerTool(
    "wa_glossary",
    {
      title: "Glossário",
      description: "Define os termos que mais confundem no caminho: WABA, conta de mensagens, Phone Number ID, Usuário do Sistema, janela de 24h, tier, relay… Use quando o usuário misturar IDs ou conceitos.",
      inputSchema: z.strictObject({}),
      annotations: LOCAL_ONLY
    },
    async () => textResult(renderGlossary())
  );
}
