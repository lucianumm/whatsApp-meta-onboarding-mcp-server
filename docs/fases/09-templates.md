<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 9 — Templates de mensagem

`#templates`

**Objetivo:** Ter pelo menos um template APPROVED para iniciar conversas fora da janela de 24h.

## Passos
1. **[JUNTOS]** Criar no Gerenciador do WhatsApp ou pela API (POST /{waba_id}/message_templates). Categoria Marketing ou Utilidade; idioma pt_BR.
2. **[JUNTOS]** Cabeçalho de imagem: envio pela API de upload resumível da Meta (cada criação com imagem leva ~10 s; em lote, rode em segundo plano).
3. **[AUTOMÁTICO]** Acompanhe com wa_list_templates (status IN_REVIEW → APPROVED/REJECTED). Aprovação leva de minutos a dias.
4. **[JUNTOS]** hello_world já vem pronto em contas novas (en_US) e serve para o primeiro teste.

## Como saber que terminou
- [ ] Ao menos um template com status APPROVED. _(ferramenta: `wa_list_templates`)_

## Armadilhas
- `vivido` **Template criado como Utilidade volta como Marketing.**
  - Causa: A Meta reclassifica por conteúdo. Marketing é mais caro.
  - O que fazer: Reescreva em tom transacional se for o caso; aceite a reclassificação se for promoção.
- `vivido` **'Os modelos de mensagem só podem ser editados se tiverem sido rejeitados.'**
  - Causa: Regra da Meta: só REJECTED edita.
  - O que fazer: Para mudar um aprovado ou em análise, apague e recrie. Apagar funciona em qualquer status.
- `vivido` **Os templates aprovados no Gerenciador não aparecem no sistema.**
  - Causa: Estavam em outra WABA de mesmo nome. Templates não se movem entre WABAs.
  - O que fazer: Recriar na WABA certa e apagar da errada. Confira sempre pelo ID.
- `vivido` **Erro #200 ao listar/sincronizar templates.**
  - Causa: O Usuário do Sistema não tem 'Modelos de mensagem' na conta de mensagens.
  - O que fazer: Contas de mensagens → Atribuir pessoas → Modelos de mensagem (ver e gerenciar).
- `vivido` **Template com imagem no cabeçalho falha no disparo com #132012.**
  - Causa: O header_handle da criação só vale para a aprovação; cada envio precisa mandar a mídia de novo no componente header.
  - O que fazer: Inclua o header com a imagem (link ou id de mídia) em todo envio.

➡️ Próxima fase: [`primeiro-envio`](10-primeiro-envio.md)
