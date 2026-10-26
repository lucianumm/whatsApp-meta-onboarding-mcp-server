/**
 * Self-check: sobe o servidor compilado por stdio, chama as ferramentas e sai com código != 0 se algo falhar.
 * Rode com: npm run build && npm run smoke
 * Não usa token real: o caminho de erro da Graph API é exercitado com um token falso.
 */
import { strict as assert } from "node:assert";
import { Client } from "@modelcontextprotocol/client";
import { getDefaultEnvironment, StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const client = new Client({ name: "smoke-test", version: "1.0.0" });
await client.connect(
  new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    env: { ...getDefaultEnvironment(), META_ACCESS_TOKEN: "token-falso-para-teste" }
  })
);

const text = (result: Awaited<ReturnType<typeof client.callTool>>): string =>
  (result.content as { type: string; text?: string }[]).map(part => part.text ?? "").join("\n");

const { tools } = await client.listTools();
assert.deepEqual(
  tools.map(tool => tool.name).sort(),
  [
    "wa_check_app_webhook",
    "wa_check_coexistence",
    "wa_check_token",
    "wa_check_waba",
    "wa_check_webhook",
    "wa_diagnose",
    "wa_discover_ids",
    "wa_explain_error",
    "wa_glossary",
    "wa_guide_get_phase",
    "wa_guide_overview",
    "wa_guide_search",
    "wa_list_phone_numbers",
    "wa_list_templates",
    "wa_send_template_test",
    "wa_subscribe_webhooks"
  ]
);

// Toda ferramenta que altera algo precisa se declarar assim
for (const name of ["wa_send_template_test", "wa_subscribe_webhooks"]) {
  const tool = tools.find(t => t.name === name);
  assert.equal(tool?.annotations?.readOnlyHint, false, `${name} deve declarar readOnlyHint=false`);
}

// Busca por tag e por texto
const byTag = await client.callTool({ name: "wa_guide_search", arguments: { tag: "coexistencia" } });
assert.match(text(byTag), /smb_app_data/);
const byText = await client.callTool({ name: "wa_guide_search", arguments: { query: "phone number id" } });
assert.match(text(byText), /resultado/);
const tagIndex = await client.callTool({ name: "wa_guide_search", arguments: {} });
assert.match(text(tagIndex), /#irreversivel/);

// Sem META_APP_ID/SECRET, o webhook do app explica como configurar
const appWebhook = await client.callTool({ name: "wa_check_app_webhook", arguments: {} });
assert.equal(appWebhook.isError, true);
assert.match(text(appWebhook), /META_APP_ID/);

// Inscrição exige confirmação
const noSubscribe = await client.callTool({ name: "wa_subscribe_webhooks", arguments: { waba_id: "1234567890", confirm: false } });
assert.equal(noSubscribe.isError, true);
assert.match(text(noSubscribe), /Nada foi alterado/);

// Ensino (offline)
const overview = await client.callTool({ name: "wa_guide_overview", arguments: {} });
assert.ok(!overview.isError);
assert.match(text(overview), /usuario-sistema-token/);

const phase = await client.callTool({ name: "wa_guide_get_phase", arguments: { phase_id: "ids" } });
assert.ok(!phase.isError);
assert.match(text(phase), /WABA ID/);

const err131037 = await client.callTool({ name: "wa_explain_error", arguments: { query: "131037" } });
assert.match(text(err131037), /nome de exibição/i);

const errText = await client.callTool({ name: "wa_explain_error", arguments: { query: "A tela diz Conta com restrição" } });
assert.match(text(errText), /restri/i);

const nothing = await client.callTool({ name: "wa_explain_error", arguments: { query: "zzzzzz" } });
assert.match(text(nothing), /Nada no catálogo/);

// Entrada inválida volta como erro legível
const badPhase = await client.callTool({ name: "wa_guide_get_phase", arguments: { phase_id: "nao-existe" } });
assert.equal(badPhase.isError, true);

// Recursos e prompt
const { resources } = await client.listResources();
assert.ok(resources.some(resource => resource.uri === "wa-guide://fase/webhook"), "fases devem aparecer em resources/list");
const resource = await client.readResource({ uri: "wa-guide://fase/templates" });
assert.match(JSON.stringify(resource.contents), /APPROVED/);
const prompt = await client.getPrompt({ name: "wa_conduzir_onboarding", arguments: { situacao: "Tenho um número virtual novo" } });
assert.ok(prompt.messages.length > 0);

// Rede com token falso: precisa virar tool error com dica, sem vazar o token
const diag = await client.callTool({ name: "wa_diagnose", arguments: { waba_id: "1234567890" } });
assert.ok(!diag.isError, "wa_diagnose reporta problemas no texto, não como falha da ferramenta");
assert.match(text(diag), /❌/);
assert.ok(!text(diag).includes("token-falso-para-teste"), "o token nunca pode aparecer");

const waba = await client.callTool({ name: "wa_check_waba", arguments: { waba_id: "1234567890" } });
assert.equal(waba.isError, true);
assert.ok(!text(waba).includes("token-falso-para-teste"));

// Envio exige confirmação
const noConfirm = await client.callTool({ name: "wa_send_template_test", arguments: { to: "5511999999999", confirm: false, phone_number_id: "1234567890" } });
assert.equal(noConfirm.isError, true);
assert.match(text(noConfirm), /NÃO realizado/);

await client.close();
console.error("Smoke test passed");
