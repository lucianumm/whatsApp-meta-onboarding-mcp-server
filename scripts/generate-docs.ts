/**
 * Gera a pasta docs/ a partir de src/knowledge e das ferramentas do servidor compilado,
 * para a documentação nunca divergir do que o MCP responde.
 * Rode com: npm run build && npm run docs
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { getDefaultEnvironment, StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { ERRORS } from "../src/knowledge/errors.js";
import { PHASES } from "../src/knowledge/phases.js";
import { renderError, renderGlossary, renderPhase, renderTagIndex, renderTags } from "../src/knowledge/render.js";

const DOCS = "docs";
const HEADER = "<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->\n\n";
const pad = (n: number) => String(n).padStart(2, "0");
const phaseFile = (id: string) => {
  const phase = PHASES.find(p => p.id === id);
  return phase ? `${pad(phase.order)}-${phase.id}.md` : `${id}.md`;
};

rmSync(join(DOCS, "fases"), { recursive: true, force: true });
mkdirSync(join(DOCS, "fases"), { recursive: true });

// Fases: links para a próxima fase em vez de só o id
for (const phase of PHASES) {
  let text = renderPhase(phase);
  if (phase.next) text = text.replace(`➡️ Próxima fase: \`${phase.next}\``, `➡️ Próxima fase: [\`${phase.next}\`](${phaseFile(phase.next)})`);
  writeFileSync(join(DOCS, "fases", phaseFile(phase.id)), HEADER + text + "\n");
}

writeFileSync(
  join(DOCS, "erros.md"),
  HEADER + ["# Catálogo de erros", "", "`vivido` = aconteceu na prática; `doc-meta` = documentação pública da Meta (confirme na tela).", "", ...ERRORS.map(renderError)].join("\n\n") + "\n"
);
writeFileSync(join(DOCS, "glossario.md"), HEADER + renderGlossary() + "\n");
writeFileSync(join(DOCS, "tags.md"), HEADER + renderTagIndex() + "\n");

// Ferramentas: lidas do próprio servidor
const client = new Client({ name: "docs-generator", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: "node", args: ["dist/index.js"], env: getDefaultEnvironment() }));
const { tools } = await client.listTools();
await client.close();

const toolLines = ["# Ferramentas", "", "| Ferramenta | Rede | Altera algo? | Resumo |", "|---|---|---|---|"];
for (const tool of tools) {
  const a = tool.annotations ?? {};
  const summary = (tool.description ?? "").split("\n")[0];
  toolLines.push(`| [\`${tool.name}\`](#${tool.name}) | ${a.openWorldHint ? "sim" : "não"} | ${a.readOnlyHint ? "não" : "**sim** (pede `confirm=true`)"} | ${summary} |`);
}
for (const tool of tools) {
  const props = (tool.inputSchema as { properties?: Record<string, { description?: string; type?: string }>; required?: string[] }).properties ?? {};
  const required = new Set((tool.inputSchema as { required?: string[] }).required ?? []);
  toolLines.push("", `## ${tool.name}`, "", `**${tool.title ?? tool.name}**`, "", tool.description ?? "");
  const entries = Object.entries(props);
  if (entries.length) {
    toolLines.push("", "| Parâmetro | Obrigatório | Descrição |", "|---|---|---|");
    for (const [name, prop] of entries) toolLines.push(`| \`${name}\` | ${required.has(name) ? "sim" : "não"} | ${(prop.description ?? "").replace(/\|/g, "\\|")} |`);
  }
}
writeFileSync(join(DOCS, "ferramentas.md"), HEADER + toolLines.join("\n") + "\n");

// Índice
const index = [
  "# Documentação",
  "",
  "## Fases do caminho",
  "",
  "| # | Fase | Tags |",
  "|---|---|---|",
  ...PHASES.map(p => `| ${p.order} | [${p.title}](fases/${phaseFile(p.id)}) | ${renderTags(p.tags)} |`),
  "",
  "## Referência",
  "",
  "- [Ferramentas do MCP](ferramentas.md)",
  "- [Catálogo de erros](erros.md)",
  "- [Glossário](glossario.md)",
  "- [Índice de tags](tags.md)"
];
writeFileSync(join(DOCS, "README.md"), HEADER + index.join("\n") + "\n");
console.error(`docs/ gerado: ${PHASES.length} fases, ${ERRORS.length} erros, ${tools.length} ferramentas`);
