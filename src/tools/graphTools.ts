import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { debugToken, formatExpiry, getCoexistence, getWaba, listAppSubscriptions, listPhones, listSubscribedApps, listTemplates, type PhoneInfo } from "../api.js";
import { GRAPH_VERSION, graphPost, requireAppToken } from "../graph.js";
import { clip, formatField, formatted, phoneIdField, READ_ONLY, resolvePhone, resolveWaba, ResponseFormat, wabaIdField } from "./common.js";

const WABA_SCOPES = ["whatsapp_business_management", "whatsapp_business_messaging"];

function phoneLines(phone: PhoneInfo): string[] {
  return [
    `### ${phone.display_phone_number ?? "(sem número)"} — ${phone.verified_name ?? "sem nome"} (Phone Number ID \`${phone.id}\`)`,
    `- Status: ${phone.status ?? "?"} · Verificação do código: ${phone.code_verification_status ?? "?"} · Plataforma: ${phone.platform_type ?? "?"}`,
    `- Nome de exibição: ${phone.name_status ?? "?"} · Qualidade: ${phone.quality_rating ?? "?"} · Tier: ${phone.messaging_limit_tier ?? "ainda não informado"}`,
    ...(phone.is_on_biz_app !== undefined ? [`- Também no app WhatsApp Business (coexistência): ${phone.is_on_biz_app ? "sim" : "não"}`] : [])
  ];
}

export function registerGraphTools(server: McpServer): void {
  server.registerTool(
    "wa_check_token",
    {
      title: "Conferir o token",
      description: `Valida o META_ACCESS_TOKEN com debug_token: se é de Usuário do Sistema (SYSTEM_USER), se expira, quais permissões tem e a quais contas de WhatsApp dá acesso. Nunca mostra o token.

Use logo depois de gerar o token (fase 'usuario-sistema-token') ou quando aparecer 'Session has expired'.`,
      inputSchema: z.strictObject({ response_format: formatField }),
      annotations: READ_ONLY
    },
    async ({ response_format }, ctx) => {
      const data = await debugToken(ctx.mcpReq.signal);
      const scopes = data.scopes ?? [];
      const missing = WABA_SCOPES.filter(scope => !scopes.includes(scope));
      const wabaTargets = [...new Set((data.granular_scopes ?? []).filter(item => WABA_SCOPES.includes(item.scope)).flatMap(item => item.target_ids ?? []))];
      const result = {
        valid: data.is_valid ?? false,
        type: data.type ?? "desconhecido",
        app: data.application ?? data.app_id ?? "desconhecido",
        expires: formatExpiry(data.expires_at),
        permanent: !data.expires_at,
        scopes,
        missing_whatsapp_scopes: missing,
        waba_ids_with_access: wabaTargets
      };
      const verdict = [
        result.valid ? "✅ token válido" : "❌ token INVÁLIDO",
        data.type === "SYSTEM_USER" ? "✅ Usuário do Sistema" : `⚠️ tipo ${result.type} (token de usuário comum expira em horas; gere um de Usuário do Sistema)`,
        result.permanent ? "✅ nunca expira" : `⚠️ ${result.expires}`,
        missing.length === 0 ? "✅ permissões de WhatsApp presentes" : `❌ faltam: ${missing.join(", ")}`
      ];
      const md = [
        "# Token",
        ...verdict.map(line => `- ${line}`),
        `- App: ${result.app}`,
        `- Contas de WhatsApp com acesso (granular_scopes): ${wabaTargets.length ? wabaTargets.join(", ") : "nenhuma listada — atribua a WABA ao Usuário do Sistema"}`
      ].join("\n");
      return formatted(response_format, result, md);
    }
  );

  server.registerTool(
    "wa_discover_ids",
    {
      title: "Descobrir WABA ID e Phone Number ID",
      description: `A partir do token, lista as contas de WhatsApp (WABA) a que ele tem acesso e os números de cada uma, já com os IDs certos para colocar no sistema. Resolve a confusão entre o ID do Gerenciador do WhatsApp e o WABA ID da API (fase 'ids').

Se a conta que você procura não aparece, o Usuário do Sistema não foi atribuído a ela.`,
      inputSchema: z.strictObject({ response_format: formatField }),
      annotations: READ_ONLY
    },
    async ({ response_format }, ctx) => {
      const data = await debugToken(ctx.mcpReq.signal);
      const targets = [...new Set((data.granular_scopes ?? []).filter(item => WABA_SCOPES.includes(item.scope)).flatMap(item => item.target_ids ?? []))];
      if (targets.length === 0) {
        return formatted(
          response_format,
          { wabas: [] },
          "Nenhuma conta de WhatsApp listada para este token. Atribua a WABA ao Usuário do Sistema (Configurações do negócio → Contas do WhatsApp → Atribuir pessoas) e gere/valide o token de novo. Veja a fase 'usuario-sistema-token'."
        );
      }
      const wabas = [];
      for (const id of targets) {
        try {
          const waba = await getWaba(id, ctx.mcpReq.signal);
          const phones = await listPhones(id, ctx.mcpReq.signal).catch(() => [] as PhoneInfo[]);
          wabas.push({ waba_id: id, name: waba.name ?? "?", review: waba.account_review_status ?? "?", phones: phones.map(p => ({ phone_number_id: p.id, display: p.display_phone_number, name: p.verified_name, status: p.status })) });
        } catch (error) {
          wabas.push({ waba_id: id, name: "(sem acesso de leitura)", review: String(error instanceof Error ? error.message.split("\n")[0] : error), phones: [] });
        }
      }
      const md = [
        "# Contas e números que o token enxerga",
        ...wabas.flatMap(w => [
          `\n## ${w.name} — WABA ID \`${w.waba_id}\` (análise: ${w.review})`,
          ...(w.phones.length ? w.phones.map(p => `- ${p.display ?? "?"} · ${p.name ?? "sem nome"} · status ${p.status ?? "?"} · **Phone Number ID \`${p.phone_number_id}\`**`) : ["- nenhum número nesta conta"])
        ])
      ].join("\n");
      return formatted(response_format, { wabas }, clip(md));
    }
  );

  server.registerTool(
    "wa_check_waba",
    {
      title: "Conferir a conta (WABA)",
      description: `Lê a WABA: nome, moeda, status da análise da conta e da verificação da empresa. Falha com #100 se o WABA ID estiver trocado ou o usuário não tiver acesso (fases 'ids' e 'usuario-sistema-token').`,
      inputSchema: z.strictObject({ waba_id: wabaIdField, response_format: formatField }),
      annotations: READ_ONLY
    },
    async ({ waba_id, response_format }, ctx) => {
      const waba = await getWaba(resolveWaba(waba_id), ctx.mcpReq.signal);
      const md = [
        `# WABA ${waba.name ?? "?"} (\`${waba.id}\`)`,
        `- Análise da conta: ${waba.account_review_status ?? "?"}`,
        `- Verificação da empresa: ${waba.business_verification_status ?? "?"}`,
        `- Moeda: ${waba.currency ?? "NÃO definida"} · Fuso: ${waba.timezone_id ?? "?"}`,
        ...(waba.health_status?.can_send_message ? [`- Pode enviar mensagem: ${waba.health_status.can_send_message}`] : [])
      ].join("\n");
      return formatted(response_format, { ...waba }, md);
    }
  );

  server.registerTool(
    "wa_list_phone_numbers",
    {
      title: "Listar números da WABA",
      description: `Lista os números da WABA com Phone Number ID, status (CONNECTED), verificação do código, plataforma (CLOUD_API), nome de exibição (name_status: APPROVED libera envio; PENDING_REVIEW causa o erro 131037), qualidade e tier de mensagens.`,
      inputSchema: z.strictObject({ waba_id: wabaIdField, response_format: formatField }),
      annotations: READ_ONLY
    },
    async ({ waba_id, response_format }, ctx) => {
      const phones = await listPhones(resolveWaba(waba_id), ctx.mcpReq.signal);
      const md = phones.length ? ["# Números", ...phones.flatMap(phoneLines)].join("\n") : "Nenhum número nesta WABA. Veja a fase 'conta-e-numero'.";
      return formatted(response_format, { phones }, clip(md));
    }
  );

  server.registerTool(
    "wa_check_webhook",
    {
      title: "Conferir a inscrição do webhook",
      description: `Lista os apps inscritos na WABA (GET /{waba_id}/subscribed_apps). Se estiver vazio, a Meta não entrega eventos desta conta (mensagem enviada e 'não chegou no sistema'). A URL de callback e os campos assinados ficam no painel do app e não aparecem aqui.`,
      inputSchema: z.strictObject({ waba_id: wabaIdField, response_format: formatField }),
      annotations: READ_ONLY
    },
    async ({ waba_id, response_format }, ctx) => {
      const apps = await listSubscribedApps(resolveWaba(waba_id), ctx.mcpReq.signal);
      const md = apps.length
        ? ["# Apps inscritos", ...apps.map(app => `- ${app.name ?? "?"} (\`${app.id ?? "?"}\`)`)].join("\n")
        : "❌ Nenhum app inscrito nesta WABA. Inscreva com POST /{waba_id}/subscribed_apps (botão 'Assinar webhooks' do sistema) e confira o callback no painel do app. Fase 'webhook'.";
      return formatted(response_format, { subscribed_apps: apps }, md);
    }
  );

  server.registerTool(
    "wa_list_templates",
    {
      title: "Listar templates",
      description: `Lista os templates da WABA com status (APPROVED, IN_REVIEW, REJECTED…), categoria e idioma. Pagina com limit/after. Erro #200 = Usuário do Sistema sem 'Modelos de mensagem' na conta de mensagens.`,
      inputSchema: z.strictObject({
        waba_id: wabaIdField,
        limit: z.number().int().min(1).max(100).default(25).describe("Quantos templates por página"),
        after: z.string().max(500).optional().describe("Cursor 'next_after' da página anterior"),
        response_format: formatField
      }),
      annotations: READ_ONLY
    },
    async ({ waba_id, limit, after, response_format }, ctx) => {
      const { templates, next } = await listTemplates(resolveWaba(waba_id), limit, after, ctx.mcpReq.signal);
      const lines = templates.length
        ? ["# Templates", ...templates.map(t => `- \`${t.name}\` [${t.language ?? "?"}] — ${t.status} (${t.category ?? "?"})`)]
        : ["Nenhum template. Veja a fase 'templates'; hello_world (en_US) costuma existir em contas novas."];
      if (next) lines.push("", `Mais resultados: chame de novo com after="${next}".`);
      return formatted(response_format, { templates, ...(next ? { next_after: next } : {}) }, clip(lines.join("\n")));
    }
  );

  server.registerTool(
    "wa_check_coexistence",
    {
      title: "Conferir coexistência",
      description: `Teste oficial da Meta para coexistência: GET /{phone_number_id}?fields=is_on_biz_app,platform_type. is_on_biz_app=true + CLOUD_API = o número está no app WhatsApp Business E na Cloud API. Mostra também a vazão (fixa em 20 mps com coexistência).

Use depois de concluir o Cadastro Incorporado (fase 'coexistencia') ou para provar que um número NÃO está em coexistência.`,
      inputSchema: z.strictObject({ phone_number_id: phoneIdField, response_format: formatField }),
      annotations: READ_ONLY
    },
    async ({ phone_number_id, response_format }, ctx) => {
      const info = await getCoexistence(resolvePhone(phone_number_id), ctx.mcpReq.signal);
      const active = info.is_on_biz_app === true && info.platform_type === "CLOUD_API";
      const verdict = active
        ? "✅ Coexistência ATIVA: o número está no app WhatsApp Business e na Cloud API."
        : info.platform_type === "CLOUD_API"
          ? "ℹ️ Só Cloud API (sem app no celular). Coexistência não está ativa — para ativá-la o número precisaria estar SÓ no app antes do Cadastro Incorporado."
          : `⚠️ platform_type = ${info.platform_type ?? "?"}: o número não está na Cloud API.`;
      const md = [
        `# Coexistência — ${info.display_phone_number ?? info.id}`,
        verdict,
        `- is_on_biz_app: ${String(info.is_on_biz_app ?? "?")} · platform_type: ${info.platform_type ?? "?"} · status: ${info.status ?? "?"} · vazão: ${info.throughput?.level ?? "?"}`
      ].join("\n");
      return formatted(response_format, { ...info, coexistence_active: active }, md);
    }
  );

  server.registerTool(
    "wa_check_app_webhook",
    {
      title: "Conferir o webhook do app",
      description: `Mostra a URL de callback e os campos assinados do app (GET /{app_id}/subscriptions). Exige META_APP_ID e META_APP_SECRET no ambiente do MCP (token de app). Use quando 'a mensagem não chega no sistema': callback vazio ou campo 'messages' faltando foi uma causa real comprovada. Para coexistência, confere também smb_message_echoes, history e smb_app_state_sync.`,
      inputSchema: z.strictObject({ response_format: formatField }),
      annotations: READ_ONLY
    },
    async ({ response_format }, ctx) => {
      const appToken = requireAppToken();
      const subscriptions = await listAppSubscriptions(process.env.META_APP_ID ?? "", appToken, ctx.mcpReq.signal);
      const waba = subscriptions.find(item => item.object === "whatsapp_business_account");
      const fields = (waba?.fields ?? []).map(field => field.name);
      const coexFields = ["smb_message_echoes", "history", "smb_app_state_sync"];
      const lines = ["# Webhook do app"];
      if (!waba) {
        lines.push("❌ Nenhuma assinatura do objeto 'WhatsApp Business Account'. Configure callback + verify token e assine 'messages' (fase 'webhook').");
      } else {
        lines.push(
          `- Callback: ${waba.callback_url ?? "(vazio)"} · ativo: ${String(waba.active ?? "?")}`,
          `- ${fields.includes("messages") ? "✅" : "❌"} messages`,
          `- Campos assinados: ${fields.join(", ") || "nenhum"}`,
          `- Coexistência: ${coexFields.map(field => `${fields.includes(field) ? "✅" : "—"} ${field}`).join(" · ")}`
        );
      }
      return formatted(response_format, { subscriptions }, lines.join("\n"));
    }
  );

  server.registerTool(
    "wa_subscribe_webhooks",
    {
      title: "Inscrever o app na WABA (altera configuração)",
      description: `POST /{waba_id}/subscribed_apps: faz a Meta entregar os eventos desta WABA ao app do token. Sem isso nenhuma mensagem recebida nem status chega. Opcional: override_callback_uri + verify_token para um callback só desta WABA (app compartilhado entre sistemas) — a URL precisa responder ao handshake com esse verify_token.

Altera configuração na Meta: exige confirm=true depois de o usuário concordar. Repetir é inofensivo.`,
      inputSchema: z.strictObject({
        waba_id: wabaIdField,
        override_callback_uri: z.url().optional().describe("Callback HTTPS só para esta WABA (opcional)"),
        verify_token: z.string().min(1).max(200).optional().describe("Verify token do override_callback_uri (obrigatório com ele). Não é segredo da Meta, mas não o exiba à toa."),
        confirm: z.boolean().describe("Precisa ser true, depois de o usuário concordar.")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ waba_id, override_callback_uri, verify_token, confirm }, ctx) => {
      if (!confirm) {
        return { isError: true, content: [{ type: "text" as const, text: "Nada foi alterado: confirm precisa ser true. Confirme com o usuário qual WABA será inscrita." }] };
      }
      if (override_callback_uri && !verify_token) {
        return { isError: true, content: [{ type: "text" as const, text: "override_callback_uri exige verify_token (o mesmo que o seu receptor espera no handshake)." }] };
      }
      const wabaId = resolveWaba(waba_id);
      const body = override_callback_uri ? { override_callback_uri, verify_token } : {};
      const response = await graphPost<{ success?: boolean }>(`${wabaId}/subscribed_apps`, body, ctx.mcpReq.signal);
      return formatted(
        ResponseFormat.MARKDOWN,
        {},
        response.success
          ? `✅ App inscrito na WABA \`${wabaId}\`${override_callback_uri ? ` com callback próprio ${override_callback_uri}` : ""}. Confira com wa_check_webhook e mande uma mensagem real.`
          : `A Meta respondeu sem success=true: ${JSON.stringify(response)}`
      );
    }
  );

  server.registerTool(
    "wa_send_template_test",
    {
      title: "Enviar template de teste (envia de verdade)",
      description: `ENVIA uma mensagem real de template pelo número e pode gerar cobrança. Use só na fase 'primeiro-envio', para um contato seu, depois de wa_diagnose sem FAIL.

Exige confirm=true e o destinatário explícito (somente dígitos com DDI, ex.: 5511999999999). O padrão é hello_world / en_US. Devolve o wamid; a entrega real aparece no webhook de status (erros como 131037 e 131042 só aparecem lá).`,
      inputSchema: z.strictObject({
        to: z.string().regex(/^\d{10,15}$/, "Só dígitos, com DDI").describe("Destinatário, ex.: 5511999999999"),
        template_name: z.string().min(1).max(512).default("hello_world").describe("Nome exato do template APPROVED"),
        language_code: z.string().min(2).max(10).default("en_US").describe("Idioma exato do template, ex.: en_US, pt_BR"),
        phone_number_id: phoneIdField,
        confirm: z.boolean().describe("Precisa ser true. O agente só deve passar true depois de o usuário confirmar o destinatário e o envio.")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true }
    },
    async ({ to, template_name, language_code, phone_number_id, confirm }, ctx) => {
      if (!confirm) {
        return { isError: true, content: [{ type: "text" as const, text: "Envio NÃO realizado: confirm precisa ser true. Confirme com o usuário o destinatário e que ele aceita a cobrança do template." }] };
      }
      const phoneId = resolvePhone(phone_number_id);
      const response = await graphPost<{ messages?: { id: string }[]; contacts?: { wa_id: string }[] }>(
        `${phoneId}/messages`,
        { messaging_product: "whatsapp", to, type: "template", template: { name: template_name, language: { code: language_code } } },
        ctx.mcpReq.signal
      );
      const wamid = response.messages?.[0]?.id ?? "(sem id)";
      return formatted(
        ResponseFormat.MARKDOWN,
        {},
        `✅ Aceito pela Meta (Graph ${GRAPH_VERSION}). wamid: \`${wamid}\`\n\nAceito pela API NÃO é entregue: confirme no celular e no webhook de status. Se não chegar, use wa_explain_error com o código do campo 'errors' do evento.`
      );
    }
  );
}
