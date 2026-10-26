# Contribuir

O valor deste MCP está no conhecimento. Código só muda quando uma ferramenta nova faz falta.

## Acrescentar uma armadilha

1. Em [`src/knowledge/phases.ts`](src/knowledge/phases.ts), na fase certa, acrescente em `pitfalls`:
   ```ts
   {
     symptom: "O que aparece na tela/API, com o texto exato",
     cause: "O que era de verdade",
     fix: "O que resolveu",
     lived: true, // true só se aconteceu com você; false se veio da doc da Meta
   }
   ```
2. Se tem código ou mensagem de erro, acrescente também em [`src/knowledge/errors.ts`](src/knowledge/errors.ts), com `keywords` que alguém colaria da tela e `tags` do vocabulário.
3. Rode `npm run check` e faça commit de `docs/` junto.
4. Atualize o [CHANGELOG.md](CHANGELOG.md).

## Regras do conteúdo

- **Escreva o que foi visto, não o que se supõe.** Hipótese vai marcada como hipótese.
- **Uma tag nova** só entra em `TAGS` (`src/knowledge/types.ts`) se nenhuma das atuais servir.
- **Passos dizem quem faz**: `voce` (só a pessoa consegue), `automatico` (o MCP faz/confere), `ambos`.
- **Nunca** coloque tokens, App Secret, senhas, telefones de clientes ou IDs privados.

## Ferramenta nova

- Prefixo `wa_`, `title`, `description` que diga quando usar, `annotations` corretas.
- Alterou algo na Meta? `readOnlyHint: false` e parâmetro `confirm` obrigatório.
- Acrescente no `scripts/smoke.ts`.
