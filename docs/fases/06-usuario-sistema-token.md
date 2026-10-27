<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 6 — Usuário do Sistema e token permanente

`#token` `#seguranca`

**Objetivo:** Ter um token que não expira, com acesso mínimo, enxergando a WABA certa.

## Passos
1. **[VOCÊ]** Configurações do negócio → Usuários → Usuários do sistema → Adicionar. Papel Employee (menor privilégio). Primeira vez no portfólio, a Meta pede para aceitar a política de não discriminação.
2. **[VOCÊ]** Atribuir ativos (mínimo): o APP com 'Desenvolver app' (sem 'Gerenciar app'); a CONTA DO WHATSAPP com 'Números de telefone (ver e gerenciar)' + 'Mensagens', com 'Tudo' desligado.
3. **[VOCÊ]** Em Contas do WhatsApp → a conta de mensagens → Atribuir pessoas: dê também 'Modelos de mensagem (ver e gerenciar)' ao usuário. Sem isso listar/criar templates dá erro #200.
4. **[VOCÊ]** Gerar token: escolha o app, validade 'Nunca expira', marque whatsapp_business_messaging e whatsapp_business_management. A Meta mostra o token UMA vez.
5. **[VOCÊ]** Cole o token só no seu sistema / na variável META_ACCESS_TOKEN do MCP. Quem digita segredos é você — o agente não.
6. **[AUTOMÁTICO]** Valide com wa_check_token: type = SYSTEM_USER, expires_at = 0, escopos de WhatsApp presentes.

## Como saber que terminou
- [ ] debug_token: type SYSTEM_USER, expires_at 0, is_valid true. _(ferramenta: `wa_check_token`)_

## Armadilhas
- `vivido` **'Session has expired' horas depois de configurar; canal vira ERROR.**
  - Causa: Era um token de usuário comum (curta duração).
  - O que fazer: Gere token de Usuário do Sistema com 'Nunca expira'. Ponte provisória: trocar token curto por longo (60 dias) com GET /oauth/access_token?grant_type=fb_exchange_token&client_id=…&client_secret=…&fb_exchange_token=… .
- `vivido` **Token válido, mas a WABA não aparece.**
  - Causa: O Usuário do Sistema não foi atribuído àquela WABA (atribuir a uma WABA não vale para as outras).
  - O que fazer: Atribuir pessoas na WABA certa. Depois de salvar, a tela às vezes mostra 'Nenhum ativo atribuído' — recarregue antes de concluir que falhou.
- `vivido` **(#10) 'You do not have WhatsApp granular permission for sending messages on behalf of this WhatsApp Business Account' ao enviar.**
  - Causa: O escopo do token existe, mas o Usuário do Sistema não tem controle de mensagens sobre a WABA. Atribuir só 'Modelos de mensagem' basta para listar templates e NÃO basta para enviar. O token antigo pode não herdar a permissão nova.
  - O que fazer: Adicionar a WABA aos ativos do usuário com Controle total (ou Números + Mensagens), gerar um token novo e colar no sistema. Confira o granular_scopes com wa_check_token. Depois do ajuste o erro some no envio seguinte.
- `vivido` **O usuário tem 'Acesso total' na conta, com pagamento e atribuição.**
  - Causa: Atribuição mais ampla que o necessário.
  - O que fazer: Reduza para Números (ver e gerenciar) + Mensagens (+ Modelos).

➡️ Próxima fase: [`webhook`](07-webhook.md)
