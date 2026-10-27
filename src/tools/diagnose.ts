import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { debugToken, formatExpiry, getPhoneHealth, getWaba, listPhones, listSubscribedApps, listTemplates, type PhoneInfo, type TemplateInfo, type WabaInfo } from "../api.js";
import { PHASES } from "../knowledge/phases.js";
import { clip, formatField, formatted, READ_ONLY, wabaIdField } from "./common.js";

type Level = "ok" | "warn" | "fail" | "info";

interface Check {
  level: Level;
  title: string;
  detail: string;
  phase?: string;
}

const ICON: Record<Level, string> = { ok: "✅", warn: "⚠️", fail: "❌", info: "ℹ️" };
const WABA_SCOPES = ["whatsapp_business_management", "whatsapp_business_messaging"];

function errorLine(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function registerDiagnoseTool(server: McpServer): void {
  server.registerTool(
    "wa_diagnose",
    {
      title: "Diagnóstico completo do caminho",
      description: `Roda o checklist inteiro pela Graph API (somente leitura): token, WABA, moeda, verificação da empresa, números (status, nome de exibição, plataforma), webhook e templates. Devolve ✅/⚠️/❌ por item e a PRÓXIMA FASE do caminho que precisa de atenção.

É a ferramenta para "em que ponto estou?" e "por que a mensagem não sai/chega?". Se waba_id for omitido, usa META_WABA_ID ou a única WABA que o token enxerga. Não verifica forma de pagamento (a API não expõe): confira no billing hub.`,
      inputSchema: z.strictObject({ waba_id: wabaIdField, response_format: formatField }),
      annotations: READ_ONLY
    },
    async ({ waba_id, response_format }, ctx) => {
      const signal = ctx.mcpReq.signal;
      const checks: Check[] = [];
      let wabaId = waba_id ?? process.env.META_WABA_ID;
      let tokenBroken = false;

      // 1) Token
      try {
        const token = await debugToken(signal);
        if (!token.is_valid) tokenBroken = true;
        checks.push({ level: token.is_valid ? "ok" : "fail", title: "Token válido", detail: token.is_valid ? "debug_token aceitou o token." : "Token inválido ou expirado.", phase: "usuario-sistema-token" });
        checks.push(
          token.type === "SYSTEM_USER"
            ? { level: "ok", title: "Token de Usuário do Sistema", detail: `Validade: ${formatExpiry(token.expires_at)}.`, phase: "usuario-sistema-token" }
            : { level: "warn", title: "Token NÃO é de Usuário do Sistema", detail: `Tipo ${token.type ?? "?"}, ${formatExpiry(token.expires_at)}. Tokens de usuário comum expiram em horas.`, phase: "usuario-sistema-token" }
        );
        const missing = WABA_SCOPES.filter(scope => !(token.scopes ?? []).includes(scope));
        checks.push(
          missing.length === 0
            ? { level: "ok", title: "Permissões de WhatsApp", detail: WABA_SCOPES.join(", "), phase: "usuario-sistema-token" }
            : { level: "fail", title: "Faltam permissões de WhatsApp", detail: missing.join(", "), phase: "usuario-sistema-token" }
        );
        const targets = [...new Set((token.granular_scopes ?? []).filter(item => WABA_SCOPES.includes(item.scope)).flatMap(item => item.target_ids ?? []))];
        if (!wabaId) {
          if (targets.length === 1) {
            wabaId = targets[0];
            checks.push({ level: "info", title: "WABA escolhida automaticamente", detail: `O token enxerga só a WABA ${wabaId}.`, phase: "ids" });
          } else {
            checks.push({
              level: "fail",
              title: "WABA não definida",
              detail: targets.length ? `O token enxerga várias: ${targets.join(", ")}. Informe waba_id.` : "O token não enxerga nenhuma WABA: atribua a conta ao Usuário do Sistema.",
              phase: targets.length ? "ids" : "usuario-sistema-token"
            });
          }
        } else if (targets.length > 0 && !targets.includes(wabaId)) {
          checks.push({ level: "warn", title: "WABA fora das permissões do token", detail: `O token lista ${targets.join(", ")}, mas você pediu ${wabaId}. Pode ser o ID do Gerenciador em vez do WABA ID da API.`, phase: "ids" });
        }
      } catch (error) {
        tokenBroken = true;
        checks.push({ level: "fail", title: "Não consegui validar o token", detail: errorLine(error), phase: "usuario-sistema-token" });
      }

      if (tokenBroken) {
        checks.push({ level: "info", title: "Demais verificações puladas", detail: "Sem token válido nenhuma outra checagem faz sentido. Corrija o token e rode de novo.", phase: "usuario-sistema-token" });
      } else if (wabaId) {
        // 2) WABA
        let waba: WabaInfo | undefined;
        try {
          waba = await getWaba(wabaId, signal);
          checks.push({ level: "ok", title: `WABA acessível: ${waba.name ?? "?"}`, detail: `ID ${waba.id}.`, phase: "ids" });
        } catch (error) {
          checks.push({ level: "fail", title: "WABA inacessível", detail: errorLine(error), phase: "ids" });
        }
        if (waba) {
          checks.push(
            waba.account_review_status === "APPROVED"
              ? { level: "ok", title: "Conta aprovada pela Meta", detail: "account_review_status = APPROVED.", phase: "conta-e-numero" }
              : { level: "warn", title: "Análise da conta", detail: `account_review_status = ${waba.account_review_status ?? "?"}.`, phase: "conta-e-numero" }
          );
          checks.push(
            waba.business_verification_status === "verified"
              ? { level: "ok", title: "Empresa verificada", detail: "business_verification_status = verified.", phase: "empresa-portfolio" }
              : { level: "warn", title: "Empresa não verificada", detail: `business_verification_status = ${waba.business_verification_status ?? "indisponível"}. Registrar número real exige empresa verificada.`, phase: "empresa-portfolio" }
          );
          checks.push(
            waba.currency
              ? { level: "ok", title: `Moeda definida (${waba.currency})`, detail: "A moeda é irreversível; confirme que é a certa.", phase: "faturamento" }
              : { level: "fail", title: "Moeda não definida", detail: "Causa do erro 131042. Defina no billing hub.", phase: "faturamento" }
          );
          if (waba.health_status?.can_send_message && waba.health_status.can_send_message !== "AVAILABLE") {
            checks.push({ level: "fail", title: "Saúde da conta impede envio", detail: `can_send_message = ${waba.health_status.can_send_message}. Veja o Gerenciador do WhatsApp.`, phase: "faturamento" });
          }
        }

        // 3) Números
        let phones: PhoneInfo[] = [];
        const wabaAliases = new Set<string>();
        try {
          phones = await listPhones(wabaId, signal);
          if (phones.length === 0) checks.push({ level: "fail", title: "Nenhum número na WABA", detail: "Adicione o número (fase conta-e-numero).", phase: "conta-e-numero" });
        } catch (error) {
          checks.push({ level: "fail", title: "Não consegui listar os números", detail: errorLine(error), phase: "ids" });
        }
        for (const phone of phones) {
          const label = `${phone.display_phone_number ?? phone.id}`;
          checks.push(
            phone.status === "CONNECTED"
              ? { level: "ok", title: `${label}: conectado`, detail: `Phone Number ID ${phone.id}.`, phase: "conta-e-numero" }
              : { level: "fail", title: `${label}: status ${phone.status ?? "?"}`, detail: "Esperado CONNECTED.", phase: "conta-e-numero" }
          );
          if (phone.name_status) {
            checks.push(
              phone.name_status === "APPROVED"
                ? { level: "ok", title: `${label}: nome de exibição aprovado`, detail: phone.verified_name ?? "", phase: "conta-e-numero" }
                : { level: "warn", title: `${label}: nome de exibição ${phone.name_status}`, detail: "Enquanto não for APPROVED, o envio falha com 131037 (número fornecido pelo WhatsApp). Só a Meta libera.", phase: "conta-e-numero" }
            );
          }
          if (phone.code_verification_status === "EXPIRED") {
            checks.push({ level: "info", title: `${label}: código de verificação EXPIRED`, detail: "Só o último código caducou; com status CONNECTED não afeta envio nem recebimento.", phase: "conta-e-numero" });
          } else if (phone.code_verification_status && phone.code_verification_status !== "VERIFIED") {
            checks.push({ level: "warn", title: `${label}: código ${phone.code_verification_status}`, detail: "Esperado VERIFIED (ou EXPIRED num número já registrado).", phase: "conta-e-numero" });
          }
          if (phone.platform_type && phone.platform_type !== "CLOUD_API") {
            checks.push({ level: "warn", title: `${label}: plataforma ${phone.platform_type}`, detail: "Esperado CLOUD_API; o número pode não estar registrado (POST /{phone_id}/register).", phase: "conta-e-numero" });
          }
          checks.push({ level: "info", title: `${label}: qualidade ${phone.quality_rating ?? "?"} · tier ${phone.messaging_limit_tier ?? "ainda não informado"}`, detail: phone.is_on_biz_app ? "Também no app WhatsApp Business (coexistência)." : "Somente Cloud API.", phase: "primeiro-envio" });

          // Saúde do número: bloqueio de pagamento (141006) e o ID da WABA que a Meta realmente usa.
          try {
            const health = await getPhoneHealth(phone.id, signal);
            const blocked = (health?.entities ?? []).filter(entity => entity.can_send_message && entity.can_send_message !== "AVAILABLE");
            if (blocked.length) {
              for (const entity of blocked) {
                const first = entity.errors?.[0];
                checks.push({
                  level: "fail",
                  title: `${label}: envio BLOQUEADO (${entity.entity_type ?? "?"}${first?.error_code ? ` · ${first.error_code}` : ""})`,
                  detail: `${first?.error_description ?? "can_send_message = " + entity.can_send_message}${first?.possible_solution ? ` → ${first.possible_solution}` : ""} A API aceita o envio (devolve wamid) e a mensagem não chega.`,
                  phase: first?.error_code === 141006 ? "faturamento" : "primeiro-envio"
                });
              }
            } else if (health?.entities?.length) {
              checks.push({ level: "ok", title: `${label}: saúde do número sem bloqueio`, detail: "can_send_message = AVAILABLE em número, WABA, empresa e app.", phase: "primeiro-envio" });
            }
            for (const entity of health?.entities ?? []) {
              if (entity.entity_type === "WABA" && entity.id && entity.id !== wabaId) wabaAliases.add(entity.id);
            }
          } catch (error) {
            checks.push({ level: "info", title: `${label}: saúde do número indisponível`, detail: errorLine(error), phase: "primeiro-envio" });
          }
        }

        // 4) Webhook
        try {
          const apps = await listSubscribedApps(wabaId, signal);
          checks.push(
            apps.length
              ? { level: "ok", title: "Webhook: app inscrito na WABA", detail: apps.map(app => app.name ?? app.id ?? "?").join(", "), phase: "webhook" }
              : { level: "fail", title: "Webhook: nenhum app inscrito", detail: "Sem isso a Meta não entrega mensagens recebidas nem status.", phase: "webhook" }
          );
        } catch (error) {
          checks.push({ level: "warn", title: "Webhook: não consegui conferir", detail: errorLine(error), phase: "webhook" });
        }
        // A mesma conta pode ter dois IDs; a Meta entrega pelo que aparece no health_status do número.
        for (const alias of wabaAliases) {
          try {
            const apps = await listSubscribedApps(alias, signal);
            checks.push(
              apps.length
                ? { level: "ok", title: `Webhook: app inscrito também no ID ${alias}`, detail: apps.map(app => app.name ?? app.id ?? "?").join(", "), phase: "webhook" }
                : { level: "fail", title: `Webhook: nenhum app inscrito no ID ${alias}`, detail: `O número aponta a WABA ${alias} (você usa ${wabaId}) — a mesma conta com outro ID. Sem assinatura nele, status e mensagens recebidas não chegam. Rode wa_subscribe_webhooks para ${alias}.`, phase: "webhook" }
            );
          } catch (error) {
            checks.push({ level: "warn", title: `Webhook: não consegui conferir o ID ${alias}`, detail: errorLine(error), phase: "webhook" });
          }
        }

        // 5) Templates
        try {
          const { templates } = await listTemplates(wabaId, 100, undefined, signal);
          const approved = templates.filter((t: TemplateInfo) => t.status === "APPROVED");
          checks.push(
            approved.length
              ? { level: "ok", title: `Templates aprovados: ${approved.length} de ${templates.length}`, detail: approved.slice(0, 5).map(t => t.name).join(", "), phase: "templates" }
              : { level: "warn", title: `Nenhum template aprovado (${templates.length} no total)`, detail: "Fora da janela de 24h só sai template aprovado.", phase: "templates" }
          );
        } catch (error) {
          checks.push({ level: "warn", title: "Templates: não consegui listar", detail: errorLine(error), phase: "templates" });
        }
      }

      checks.push({ level: "info", title: "Forma de pagamento", detail: "A API não expõe o cartão, mas o bloqueio aparece na saúde do número (141006), conferida acima. Cadastre no billing hub; sem cartão só funciona a janela de 24h (erros 131042/141006).", phase: "faturamento" });

      const problems = checks.filter(check => check.level === "fail" || check.level === "warn");
      const order = (phaseId?: string) => PHASES.find(phase => phase.id === phaseId)?.order ?? 99;
      const first = [...problems].sort((a, b) => order(a.phase) - order(b.phase) || (a.level === "fail" ? -1 : 1))[0];
      const summary = {
        ok: checks.filter(c => c.level === "ok").length,
        warn: checks.filter(c => c.level === "warn").length,
        fail: checks.filter(c => c.level === "fail").length,
        next_phase: first?.phase ?? null
      };

      const lines = ["# Diagnóstico", `**${summary.ok} ok · ${summary.warn} atenção · ${summary.fail} falha(s)**`, ""];
      for (const check of checks) lines.push(`${ICON[check.level]} **${check.title}** — ${check.detail}`);
      lines.push("", first ? `➡️ Comece por: fase \`${first.phase}\` (\`wa_guide_get_phase\`). Primeiro problema: ${first.title}.` : "🎉 Nada pendente nos itens verificáveis. Faça o envio de teste (fase `primeiro-envio`).");
      return formatted(response_format, { summary, checks }, clip(lines.join("\n")));
    }
  );
}
