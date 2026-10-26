# Segurança

## Segredos

- `META_ACCESS_TOKEN` e `META_APP_SECRET` vêm só do ambiente do processo. O servidor os remove de qualquer mensagem de erro antes de responder, e nunca os devolve em resultado.
- O token vai no cabeçalho `Authorization`, nunca na URL.
- Use token de **Usuário do Sistema** com o mínimo: app com "Desenvolver app"; WABA com "Números (ver e gerenciar)" + "Mensagens" (+ "Modelos de mensagem").
- `META_APP_SECRET` só é necessário para `wa_check_app_webhook`. Se não precisa dela, não configure.

## Ações

Só duas ferramentas alteram algo — `wa_subscribe_webhooks` e `wa_send_template_test` — e ambas recusam sem `confirm=true`. O agente deve pedir confirmação ao usuário antes de passar `true`.

Por desenho, o MCP não tem ferramentas para: excluir portfólio/WABA/número, cadastrar pagamento, alterar moeda, registrar número com PIN ou aceitar termos.

## Reportar um problema

Abra uma issue **sem** tokens, segredos ou telefones reais.
