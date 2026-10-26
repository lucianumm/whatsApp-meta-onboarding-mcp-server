<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 10 — Primeiro envio e verificação final

`#envio`

**Objetivo:** Provar a cadeia inteira: enviar, entregar, receber.

## Passos
1. **[AUTOMÁTICO]** Rode wa_diagnose: ele junta token, WABA, número, webhook e templates num relatório com a próxima fase a corrigir.
2. **[JUNTOS]** Envie um template aprovado para um contato SEU, sempre o mesmo em todos os testes. Use wa_send_template_test (pede confirmação explícita).
3. **[JUNTOS]** Confirme: wamid devolvido pela API, depois status delivered/read no webhook, depois responda pelo celular e veja a resposta entrar no sistema.
4. **[JUNTOS]** Disparos em massa: na API oficial o limite real é o tier (contatos novos únicos por 24h), não a velocidade. Um intervalo curto (~5 s) basta; o intervalo 'humano' longo só faz sentido em WhatsApp não oficial.

## Como saber que terminou
- [ ] wa_diagnose sem nenhum FAIL. _(ferramenta: `wa_diagnose`)_
- [ ] Mensagem entregue no celular e resposta recebida no sistema.

## Armadilhas
- `vivido` **Duas conversas para a mesma pessoa (55DD9XXXXXXXX e 55DDXXXXXXXX).**
  - Causa: Número brasileiro com e sem o nono dígito: o WhatsApp identifica de um jeito no webhook e você digitou de outro.
  - O que fazer: Gere as duas variantes do número e procure conversa/contato por qualquer uma delas.
- `vivido` **Primeiro teste 'ok' na API e nada no celular.**
  - Causa: Ver o erro real no webhook de status: 131037 (nome de exibição em análise), 131042 (pagamento), 131047 (fora da janela, precisa de template), 131030 (número de teste: destinatário fora da lista).
  - O que fazer: wa_explain_error com o código.
