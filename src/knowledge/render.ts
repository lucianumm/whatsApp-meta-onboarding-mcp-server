import { ERRORS, GLOSSARY } from "./errors.js";
import { PHASES } from "./phases.js";
import { TAGS, type ErrorEntry, type Phase, type Tag, type Who } from "./types.js";

const WHO_LABEL: Record<Who, string> = {
  voce: "VOCÊ",
  automatico: "AUTOMÁTICO",
  ambos: "JUNTOS"
};

export const TAG_NAMES = Object.keys(TAGS) as Tag[];

function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function origin(lived: boolean): string {
  return lived ? "`vivido`" : "`doc-meta`";
}

export function renderTags(tags: Tag[]): string {
  return tags.map(tag => `\`#${tag}\``).join(" ");
}

export function renderPhase(phase: Phase): string {
  const lines = [`# Fase ${phase.order} — ${phase.title}`, "", renderTags(phase.tags), "", `**Objetivo:** ${phase.goal}`, "", "## Passos"];
  phase.steps.forEach((step, index) => lines.push(`${index + 1}. **[${WHO_LABEL[step.who]}]** ${step.text}`));
  lines.push("", "## Como saber que terminou");
  for (const check of phase.checks) lines.push(`- [ ] ${check.text}${check.tool ? ` _(ferramenta: \`${check.tool}\`)_` : ""}`);
  lines.push("", "## Armadilhas");
  for (const pitfall of phase.pitfalls) {
    lines.push(`- ${origin(pitfall.lived)} **${pitfall.symptom}**`, `  - Causa: ${pitfall.cause}`, `  - O que fazer: ${pitfall.fix}`);
  }
  if (phase.next) lines.push("", `➡️ Próxima fase: \`${phase.next}\``);
  return lines.join("\n");
}

export function renderOverview(): string {
  const lines = [
    "# Caminho completo: número oficial na API do WhatsApp (Meta)",
    "",
    "Legenda: **VOCÊ** = só você consegue (login, cartão, segredos, aceite de termos); **AUTOMÁTICO** = este MCP confere/faz pela Graph API; **JUNTOS** = o agente conduz e você confirma. Armadilhas marcadas `vivido` aconteceram de verdade; `doc-meta` vêm da documentação pública (confirme na tela).",
    "",
    "| # | Fase (`id`) | Tags | Resultado |",
    "|---|---|---|---|"
  ];
  for (const phase of PHASES) lines.push(`| ${phase.order} | ${phase.title} (\`${phase.id}\`) | ${renderTags(phase.tags)} | ${phase.goal} |`);
  lines.push(
    "",
    "Comece por `wa_diagnose` se já tem token (ele diz em que fase você está) ou por `wa_guide_get_phase` com `escolher-caminho`. Para um assunto específico, `wa_guide_search` busca por texto ou tag.",
    "",
    "## O que o agente nunca faz, mesmo a pedido",
    "- Digitar ou copiar tokens, App Secret ou senhas (você cola direto no sistema).",
    "- Cadastrar cartão ou dados financeiros.",
    "- Excluir portfólio/WABA/número (ações permanentes).",
    "- Aceitar termos da Meta sem a sua confirmação explícita."
  );
  return lines.join("\n");
}

export function renderError(entry: ErrorEntry): string {
  const lines = [
    `## ${entry.code ? `#${entry.code} — ` : ""}${entry.title}`,
    `${origin(entry.lived)} ${renderTags(entry.tags)}`,
    `- **Significa:** ${entry.meaning}`,
    `- **O que fazer:** ${entry.action}`
  ];
  if (entry.phase) lines.push(`- **Fase relacionada:** \`${entry.phase}\``);
  return lines.join("\n");
}

export function renderGlossary(): string {
  return ["# Glossário", "", ...GLOSSARY.map(entry => `- **${entry.term}:** ${entry.definition}`)].join("\n");
}

export function renderTagIndex(): string {
  const lines = ["# Tags", ""];
  for (const tag of TAG_NAMES) {
    const phases = PHASES.filter(phase => phase.tags.includes(tag)).map(phase => `\`${phase.id}\``);
    const errors = ERRORS.filter(entry => entry.tags.includes(tag)).map(entry => (entry.code ? `#${entry.code}` : entry.title));
    lines.push(`## \`#${tag}\` — ${TAGS[tag]}`, `- Fases: ${phases.join(", ") || "—"}`, `- Erros: ${errors.join(", ") || "—"}`, "");
  }
  return lines.join("\n");
}

/** Procura por código exato e por palavras-chave (sem acento, sem caixa). */
export function findErrors(query: string): ErrorEntry[] {
  const folded = fold(query);
  const codes = new Set((query.match(/\d{3,7}/g) ?? []).map(Number));
  const scored = ERRORS.map(entry => {
    let score = 0;
    if (entry.code !== undefined && codes.has(entry.code)) score += 10;
    for (const keyword of entry.keywords) if (folded.includes(fold(keyword))) score += 3;
    if (folded.length >= 4 && fold(entry.title).includes(folded)) score += 2;
    return { entry, score };
  });
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.entry);
}

export interface SearchHit {
  kind: "passo" | "armadilha" | "erro";
  phase?: string;
  title: string;
  text: string;
  tags: Tag[];
}

/** Busca em passos, armadilhas e erros. Todas as palavras da consulta precisam aparecer. */
export function searchKnowledge(query: string | undefined, tag: Tag | undefined): SearchHit[] {
  const words = fold(query ?? "").split(/\s+/).filter(word => word.length >= 2);
  const matches = (text: string) => words.every(word => fold(text).includes(word));
  const hits: SearchHit[] = [];
  for (const phase of PHASES) {
    if (tag && !phase.tags.includes(tag)) continue;
    for (const step of phase.steps) {
      if (matches(step.text)) hits.push({ kind: "passo", phase: phase.id, title: phase.title, text: `[${WHO_LABEL[step.who]}] ${step.text}`, tags: phase.tags });
    }
    for (const pitfall of phase.pitfalls) {
      const text = `${pitfall.symptom} — Causa: ${pitfall.cause} — O que fazer: ${pitfall.fix}`;
      if (matches(text)) hits.push({ kind: "armadilha", phase: phase.id, title: pitfall.symptom, text, tags: phase.tags });
    }
  }
  for (const entry of ERRORS) {
    if (tag && !entry.tags.includes(tag)) continue;
    const text = `${entry.code ?? ""} ${entry.title} ${entry.meaning} ${entry.action} ${entry.keywords.join(" ")}`;
    if (matches(text)) hits.push({ kind: "erro", phase: entry.phase, title: `${entry.code ? `#${entry.code} ` : ""}${entry.title}`, text: `${entry.meaning} — O que fazer: ${entry.action}`, tags: entry.tags });
  }
  return hits;
}

/** Dica curta para anexar a erros reais da Graph API. */
export function hintForGraphError(code: number | undefined, message: string): string | undefined {
  const hits = findErrors(`${code ?? ""} ${message}`);
  const top = hits[0];
  if (!top) return undefined;
  return `${top.title}. ${top.action}${top.phase ? ` (fase: ${top.phase})` : ""}`;
}
