# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versões seguem [SemVer](https://semver.org/lang/pt-BR/).

## [1.1.0] — 2026-10-27

Implantação real do disparo local da Lumen Axis (Cloud API, número virtual, campanhas de template com imagem) até a mensagem chegar ao celular.

### Conhecimento
- Erro **#10 "granular permission for sending messages"**: o token tem o escopo, mas o Usuário do Sistema só tinha "Modelos de mensagem" na WABA; é preciso controle de mensagens e token novo.
- Erro **#10 "Business Solution Provider"**: `primary_funding_id` e afins numa WABA comum; a saúde se lê pelo número.
- **Dois IDs para a mesma conta** (WABA ID da API e "conta de mensagens"): `subscribed_apps` é por ID e a Meta entrega status e mensagens recebidas pelo que o `health_status` do número aponta. Nenhum evento chegava com o app inscrito só no outro.
- **141006 é assíncrono**: a API aceita e devolve o `wamid`, a mensagem fica "enviada" e a recusa só vem no status. Passo para saber se o cartão liberou (`can_send_message` da entidade WABA).
- Armadilha de primeiro envio "campanha toda enviada, nada no celular, nenhum status".
- Catálogo de 30 erros.

### Ferramentas
- `wa_diagnose` lê `health_status` do número: aponta bloqueio por pagamento (141006) com a solução da Meta e compara o ID da WABA do número com o configurado; se diferir, confere se o app está inscrito nesse outro ID.
- Novo `getPhoneHealth` em `src/api.ts`.

## [1.0.0] — 2026-10-26

Primeira versão, consolidando o que foi vivido em implantações reais (jul–out/2026).

### Conhecimento
- 12 fases: escolher caminho, portfólio, app, WABA e número (inclusive virtual), IDs, Usuário do Sistema e token, webhook, faturamento, templates, primeiro envio, Coexistência e Suporte da Meta.
- Armadilhas marcadas `vivido` / `doc-meta`, com sintoma → causa → o que fazer.
- Catálogo de 27 erros (131037, 131042, 141006, #3441034, #2200, #200, #100, 132012, 'Conta com restrição'…).
- Coexistência completa: parâmetros do Cadastro Incorporado (v4), página hospedada que cai na v3, `smb_app_data` uma vez em 24h, detalhes do `history`, o que se perde, saída pelo app.
- 15 tags em vocabulário fechado.

### Ferramentas
- Ensino: `wa_guide_overview`, `wa_guide_get_phase`, `wa_guide_search`, `wa_explain_error`, `wa_glossary`.
- Diagnóstico: `wa_diagnose`, `wa_check_token`, `wa_discover_ids`, `wa_check_waba`, `wa_list_phone_numbers`, `wa_check_webhook`, `wa_check_app_webhook`, `wa_list_templates`, `wa_check_coexistence`.
- Ações com `confirm=true`: `wa_subscribe_webhooks`, `wa_send_template_test`.
- Recursos `wa-guide://…` e prompt `wa_conduzir_onboarding`.

### Infra
- `docs/` gerado a partir de `src/knowledge/`; CI confere que está em dia.
- Smoke test ponta a ponta como cliente MCP, exercitando a Graph API real com token falso.
- Licença MIT.
