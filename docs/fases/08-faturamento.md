<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 8 — Moeda e forma de pagamento

`#faturamento` `#irreversivel`

**Objetivo:** A WABA tem país/moeda definidos e um cartão — senão só funciona a janela de 24h.

## Passos
1. **[VOCÊ]** Billing hub da WABA (wizard CHANGE_COUNTRY_CURRENCY): país Brasil, moeda BRL, fuso São Paulo. É IRREVERSÍVEL — decida com calma.
2. **[VOCÊ]** Cadastre a forma de pagamento (wizard ADD_PM). Dados financeiros: só você digita.
3. **[JUNTOS]** Entenda a cobrança: resposta dentro da janela de 24h aberta pelo cliente tende a ser gratuita; template iniciado pela empresa é cobrado e exige pagamento. Confirme os preços vigentes na Meta — as regras mudam (os docs do projeto citam mudança a partir de 01/10/2026; reconfirme).

## Como saber que terminou
- [ ] currency preenchida na WABA. _(ferramenta: `wa_check_waba`)_
- [ ] Forma de pagamento: a API não mostra; confira no billing hub.

## Armadilhas
- `vivido` **Erro 131042 'Business eligibility payment issue' / 'currency is not configured'.**
  - Causa: WABA nova nasce sem moeda/conta de faturamento.
  - O que fazer: Definir país/moeda no billing hub. O popup de erro genérico ao salvar pode aparecer mesmo com a moeda aplicada — confira o saldo/moeda no fim da página.
- `vivido` **'No payment method is set up' só para quem não escreveu antes; para quem escreveu funciona.**
  - Causa: Dentro da janela de 24h a mensagem é gratuita; fora dela é template cobrado.
  - O que fazer: Cadastrar cartão. Para depurar sem cartão, teste com quem acabou de escrever.
- `vivido` **Saúde do número mostra 141006 (erro no método de pagamento).**
  - Causa: Bloqueia conversas iniciadas pela empresa.
  - O que fazer: Cadastrar/corrigir a forma de pagamento.

➡️ Próxima fase: [`templates`](09-templates.md)
