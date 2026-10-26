#!/usr/bin/env node
/**
 * MCP que ensina o caminho completo de um número de WhatsApp na API oficial da
 * Meta (inclusive número virtual criado direto na Meta) e diagnostica cada etapa
 * pela Graph API. Serve stdio.
 *
 * Variáveis de ambiente (todas opcionais para as ferramentas de ensino):
 *   META_ACCESS_TOKEN   token de Usuário do Sistema (ferramentas de rede)
 *   META_WABA_ID        WABA ID padrão
 *   META_PHONE_NUMBER_ID Phone Number ID padrão
 *   META_GRAPH_VERSION  versão da Graph API (padrão v25.0)
 *   META_APP_ID / META_APP_SECRET  token de app, só para wa_check_app_webhook
 */
import { completable, McpServer, ProtocolError, ProtocolErrorCode, ResourceNotFoundError, ResourceTemplate } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { ERRORS } from "./knowledge/errors.js";
import { getPhase, PHASES } from "./knowledge/phases.js";
import { renderError, renderGlossary, renderOverview, renderPhase, renderTagIndex } from "./knowledge/render.js";
import { registerDiagnoseTool } from "./tools/diagnose.js";
import { registerGraphTools } from "./tools/graphTools.js";
import { registerGuideTools } from "./tools/guide.js";

function createServer(): McpServer {
  const server = new McpServer({ name: "whatsapp-meta-onboarding-mcp-server", version: "1.0.0" });

  registerGuideTools(server);
  registerGraphTools(server);
  registerDiagnoseTool(server);

  server.registerResource(
    "caminho-visao-geral",
    "wa-guide://visao-geral",
    { title: "Visão geral do caminho", description: "As fases do caminho do número oficial na API da Meta", mimeType: "text/markdown" },
    async uri => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: renderOverview() }] })
  );

  server.registerResource(
    "glossario",
    "wa-guide://glossario",
    { title: "Glossário", description: "WABA, Phone Number ID, Usuário do Sistema, janela de 24h…", mimeType: "text/markdown" },
    async uri => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: renderGlossary() }] })
  );

  server.registerResource(
    "tags",
    "wa-guide://tags",
    { title: "Índice de tags", description: "Cada tag com as fases e erros em que aparece", mimeType: "text/markdown" },
    async uri => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: renderTagIndex() }] })
  );

  server.registerResource(
    "catalogo-de-erros",
    "wa-guide://erros",
    { title: "Catálogo de erros", description: "Erros da Meta/WhatsApp com causa e solução", mimeType: "text/markdown" },
    async uri => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: ["# Erros", "", ...ERRORS.map(renderError)].join("\n\n") }] })
  );

  server.registerResource(
    "fase",
    new ResourceTemplate("wa-guide://fase/{phaseId}", {
      list: async () => ({ resources: PHASES.map(phase => ({ uri: `wa-guide://fase/${phase.id}`, name: `Fase ${phase.order} — ${phase.title}`, mimeType: "text/markdown" })) })
    }),
    { title: "Fase do caminho", description: "Uma fase com passos, checagens e armadilhas", mimeType: "text/markdown" },
    async (uri, { phaseId }) => {
      const phase = getPhase(String(phaseId));
      if (!phase) throw new ResourceNotFoundError(uri.href);
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: renderPhase(phase) }] };
    }
  );

  server.registerPrompt(
    "wa_conduzir_onboarding",
    {
      title: "Conduzir o onboarding do número",
      description: "Conduz o usuário, fase a fase, até ter um número oficial enviando mensagens pela API da Meta.",
      argsSchema: z.object({
        situacao: completable(z.string().optional().describe("Onde você está, em uma frase (opcional)"), value => ["Tenho um número virtual novo", "Quero migrar um número existente", "Quero coexistência", "Deu erro no envio"].filter(item => item.toLowerCase().startsWith((value ?? "").toLowerCase())))
      })
    },
    async ({ situacao }) => {
      if (situacao !== undefined && situacao.length > 500) throw new ProtocolError(ProtocolErrorCode.InvalidParams, "Descreva a situação em até 500 caracteres");
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Quero conectar um número de WhatsApp à API oficial da Meta. Situação: ${situacao ?? "(não informei)"}.`,
                "",
                "Conduza assim:",
                "1. Chame wa_guide_overview. Se houver META_ACCESS_TOKEN, chame wa_diagnose para descobrir a fase atual; senão comece em 'escolher-caminho'.",
                "2. Trabalhe UMA fase por vez com wa_guide_get_phase. Entregue os passos de VOCÊ mastigados, com o link/caminho exato da tela, e confira com as ferramentas wa_* o que for AUTOMÁTICO.",
                "3. Se aparecer um erro, use wa_explain_error antes de tentar qualquer coisa.",
                "4. Nunca peça para colar token, App Secret ou senha na conversa; nunca cadastre cartão, exclua portfólio/WABA/número nem aceite termos sem confirmação explícita.",
                "5. Termine com wa_diagnose sem falhas e o envio de teste (wa_send_template_test) para um contato meu, só depois de eu confirmar."
              ].join("\n")
            }
          }
        ]
      };
    }
  );

  return server;
}

serveStdio(createServer);
console.error("whatsapp-meta-onboarding-mcp-server running on stdio");
