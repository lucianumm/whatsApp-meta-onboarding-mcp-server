<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Ferramentas

| Ferramenta | Rede | Altera algo? | Resumo |
|---|---|---|---|
| [`wa_guide_overview`](#wa_guide_overview) | não | não | Mostra o caminho completo para ter um número (inclusive virtual) na API oficial do WhatsApp da Meta: as 12 fases em ordem, quem faz cada coisa (você / automático / juntos) e o que o agente nunca faz. |
| [`wa_guide_get_phase`](#wa_guide_get_phase) | não | não | Devolve uma fase do caminho: passos (marcados VOCÊ / AUTOMÁTICO / JUNTOS), como saber que terminou e as armadilhas reais (sintoma → causa → o que fazer). |
| [`wa_explain_error`](#wa_explain_error) | não | não | Traduz um erro da Meta/WhatsApp (código ou texto da tela) em significado, causa e o que fazer, apontando a fase do caminho relacionada. Cobre 27 erros: os vividos na prática (131037, 131042, 141006, #3441034, #2200, #200, #100, 'Conta com restrição'…) e os mais comuns da documentação pública (131047, 131030, 132001…). |
| [`wa_guide_search`](#wa_guide_search) | não | não | Busca em todos os passos, armadilhas e erros do guia, por texto (todas as palavras precisam aparecer, sem acento/caixa) e/ou por tag. Sem query e sem tag, devolve o índice de tags com as fases e erros de cada uma. |
| [`wa_glossary`](#wa_glossary) | não | não | Define os termos que mais confundem no caminho: WABA, conta de mensagens, Phone Number ID, Usuário do Sistema, janela de 24h, tier, relay… Use quando o usuário misturar IDs ou conceitos. |
| [`wa_check_token`](#wa_check_token) | sim | não | Valida o META_ACCESS_TOKEN com debug_token: se é de Usuário do Sistema (SYSTEM_USER), se expira, quais permissões tem e a quais contas de WhatsApp dá acesso. Nunca mostra o token. |
| [`wa_discover_ids`](#wa_discover_ids) | sim | não | A partir do token, lista as contas de WhatsApp (WABA) a que ele tem acesso e os números de cada uma, já com os IDs certos para colocar no sistema. Resolve a confusão entre o ID do Gerenciador do WhatsApp e o WABA ID da API (fase 'ids'). |
| [`wa_check_waba`](#wa_check_waba) | sim | não | Lê a WABA: nome, moeda, status da análise da conta e da verificação da empresa. Falha com #100 se o WABA ID estiver trocado ou o usuário não tiver acesso (fases 'ids' e 'usuario-sistema-token'). |
| [`wa_list_phone_numbers`](#wa_list_phone_numbers) | sim | não | Lista os números da WABA com Phone Number ID, status (CONNECTED), verificação do código, plataforma (CLOUD_API), nome de exibição (name_status: APPROVED libera envio; PENDING_REVIEW causa o erro 131037), qualidade e tier de mensagens. |
| [`wa_check_webhook`](#wa_check_webhook) | sim | não | Lista os apps inscritos na WABA (GET /{waba_id}/subscribed_apps). Se estiver vazio, a Meta não entrega eventos desta conta (mensagem enviada e 'não chegou no sistema'). A URL de callback e os campos assinados ficam no painel do app e não aparecem aqui. |
| [`wa_list_templates`](#wa_list_templates) | sim | não | Lista os templates da WABA com status (APPROVED, IN_REVIEW, REJECTED…), categoria e idioma. Pagina com limit/after. Erro #200 = Usuário do Sistema sem 'Modelos de mensagem' na conta de mensagens. |
| [`wa_check_coexistence`](#wa_check_coexistence) | sim | não | Teste oficial da Meta para coexistência: GET /{phone_number_id}?fields=is_on_biz_app,platform_type. is_on_biz_app=true + CLOUD_API = o número está no app WhatsApp Business E na Cloud API. Mostra também a vazão (fixa em 20 mps com coexistência). |
| [`wa_check_app_webhook`](#wa_check_app_webhook) | sim | não | Mostra a URL de callback e os campos assinados do app (GET /{app_id}/subscriptions). Exige META_APP_ID e META_APP_SECRET no ambiente do MCP (token de app). Use quando 'a mensagem não chega no sistema': callback vazio ou campo 'messages' faltando foi uma causa real comprovada. Para coexistência, confere também smb_message_echoes, history e smb_app_state_sync. |
| [`wa_subscribe_webhooks`](#wa_subscribe_webhooks) | sim | **sim** (pede `confirm=true`) | POST /{waba_id}/subscribed_apps: faz a Meta entregar os eventos desta WABA ao app do token. Sem isso nenhuma mensagem recebida nem status chega. Opcional: override_callback_uri + verify_token para um callback só desta WABA (app compartilhado entre sistemas) — a URL precisa responder ao handshake com esse verify_token. |
| [`wa_send_template_test`](#wa_send_template_test) | sim | **sim** (pede `confirm=true`) | ENVIA uma mensagem real de template pelo número e pode gerar cobrança. Use só na fase 'primeiro-envio', para um contato seu, depois de wa_diagnose sem FAIL. |
| [`wa_diagnose`](#wa_diagnose) | sim | não | Roda o checklist inteiro pela Graph API (somente leitura): token, WABA, moeda, verificação da empresa, números (status, nome de exibição, plataforma), webhook e templates. Devolve ✅/⚠️/❌ por item e a PRÓXIMA FASE do caminho que precisa de atenção. |

## wa_guide_overview

**Visão geral do caminho**

Mostra o caminho completo para ter um número (inclusive virtual) na API oficial do WhatsApp da Meta: as 12 fases em ordem, quem faz cada coisa (você / automático / juntos) e o que o agente nunca faz.

Use no início de qualquer conversa sobre "conectar número", "disparos pela API oficial" ou "número virtual". Depois aprofunde com wa_guide_get_phase. Não acessa a rede.

## wa_guide_get_phase

**Detalhar uma fase**

Devolve uma fase do caminho: passos (marcados VOCÊ / AUTOMÁTICO / JUNTOS), como saber que terminou e as armadilhas reais (sintoma → causa → o que fazer).

Fases (id): escolher-caminho, empresa-portfolio, app-meta, conta-e-numero, ids, usuario-sistema-token, webhook, faturamento, templates, primeiro-envio, coexistencia, suporte-meta.

Exemplos:
  - "Como crio o token permanente?" -> phase_id="usuario-sistema-token"
  - "Qual ID é o WABA ID?" -> phase_id="ids"
  - "Vale a pena tentar coexistência?" -> phase_id="coexistencia"

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `phase_id` | sim | Identificador da fase |

## wa_explain_error

**Explicar um erro**

Traduz um erro da Meta/WhatsApp (código ou texto da tela) em significado, causa e o que fazer, apontando a fase do caminho relacionada. Cobre 27 erros: os vividos na prática (131037, 131042, 141006, #3441034, #2200, #200, #100, 'Conta com restrição'…) e os mais comuns da documentação pública (131047, 131030, 132001…).

Exemplos:
  - "Deu 131037 no envio" -> query="131037"
  - "A tela diz Conta com restrição" -> query="conta com restrição"
Retorna vazio com sugestões se nada bater.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `query` | sim | Código (ex.: 131042) ou trecho da mensagem de erro |

## wa_guide_search

**Buscar no guia (texto ou tag)**

Busca em todos os passos, armadilhas e erros do guia, por texto (todas as palavras precisam aparecer, sem acento/caixa) e/ou por tag. Sem query e sem tag, devolve o índice de tags com as fases e erros de cada uma.

Tags: #cloud-api, #numero-virtual, #coexistencia, #portfolio, #app, #waba, #ids, #token, #webhook, #faturamento, #templates, #envio, #suporte, #seguranca, #irreversivel.

Exemplos:
  - "Onde fica o Phone Number ID?" -> query="phone number id"
  - "Tudo de coexistência" -> tag="coexistencia"
  - "O que é irreversível?" -> tag="irreversivel"

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `query` | não | Palavras a procurar |
| `tag` | não | Filtrar por tag (sem o #) |

## wa_glossary

**Glossário**

Define os termos que mais confundem no caminho: WABA, conta de mensagens, Phone Number ID, Usuário do Sistema, janela de 24h, tier, relay… Use quando o usuário misturar IDs ou conceitos.

## wa_check_token

**Conferir o token**

Valida o META_ACCESS_TOKEN com debug_token: se é de Usuário do Sistema (SYSTEM_USER), se expira, quais permissões tem e a quais contas de WhatsApp dá acesso. Nunca mostra o token.

Use logo depois de gerar o token (fase 'usuario-sistema-token') ou quando aparecer 'Session has expired'.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |

## wa_discover_ids

**Descobrir WABA ID e Phone Number ID**

A partir do token, lista as contas de WhatsApp (WABA) a que ele tem acesso e os números de cada uma, já com os IDs certos para colocar no sistema. Resolve a confusão entre o ID do Gerenciador do WhatsApp e o WABA ID da API (fase 'ids').

Se a conta que você procura não aparece, o Usuário do Sistema não foi atribuído a ela.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |

## wa_check_waba

**Conferir a conta (WABA)**

Lê a WABA: nome, moeda, status da análise da conta e da verificação da empresa. Falha com #100 se o WABA ID estiver trocado ou o usuário não tiver acesso (fases 'ids' e 'usuario-sistema-token').

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `waba_id` | não | WABA ID da API (o da URL de Configurações do negócio → Contas do WhatsApp). Se omitido, usa META_WABA_ID. |
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |

## wa_list_phone_numbers

**Listar números da WABA**

Lista os números da WABA com Phone Number ID, status (CONNECTED), verificação do código, plataforma (CLOUD_API), nome de exibição (name_status: APPROVED libera envio; PENDING_REVIEW causa o erro 131037), qualidade e tier de mensagens.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `waba_id` | não | WABA ID da API (o da URL de Configurações do negócio → Contas do WhatsApp). Se omitido, usa META_WABA_ID. |
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |

## wa_check_webhook

**Conferir a inscrição do webhook**

Lista os apps inscritos na WABA (GET /{waba_id}/subscribed_apps). Se estiver vazio, a Meta não entrega eventos desta conta (mensagem enviada e 'não chegou no sistema'). A URL de callback e os campos assinados ficam no painel do app e não aparecem aqui.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `waba_id` | não | WABA ID da API (o da URL de Configurações do negócio → Contas do WhatsApp). Se omitido, usa META_WABA_ID. |
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |

## wa_list_templates

**Listar templates**

Lista os templates da WABA com status (APPROVED, IN_REVIEW, REJECTED…), categoria e idioma. Pagina com limit/after. Erro #200 = Usuário do Sistema sem 'Modelos de mensagem' na conta de mensagens.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `waba_id` | não | WABA ID da API (o da URL de Configurações do negócio → Contas do WhatsApp). Se omitido, usa META_WABA_ID. |
| `limit` | não | Quantos templates por página |
| `after` | não | Cursor 'next_after' da página anterior |
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |

## wa_check_coexistence

**Conferir coexistência**

Teste oficial da Meta para coexistência: GET /{phone_number_id}?fields=is_on_biz_app,platform_type. is_on_biz_app=true + CLOUD_API = o número está no app WhatsApp Business E na Cloud API. Mostra também a vazão (fixa em 20 mps com coexistência).

Use depois de concluir o Cadastro Incorporado (fase 'coexistencia') ou para provar que um número NÃO está em coexistência.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `phone_number_id` | não | Phone Number ID (não é o telefone). Se omitido, usa META_PHONE_NUMBER_ID. |
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |

## wa_check_app_webhook

**Conferir o webhook do app**

Mostra a URL de callback e os campos assinados do app (GET /{app_id}/subscriptions). Exige META_APP_ID e META_APP_SECRET no ambiente do MCP (token de app). Use quando 'a mensagem não chega no sistema': callback vazio ou campo 'messages' faltando foi uma causa real comprovada. Para coexistência, confere também smb_message_echoes, history e smb_app_state_sync.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |

## wa_subscribe_webhooks

**Inscrever o app na WABA (altera configuração)**

POST /{waba_id}/subscribed_apps: faz a Meta entregar os eventos desta WABA ao app do token. Sem isso nenhuma mensagem recebida nem status chega. Opcional: override_callback_uri + verify_token para um callback só desta WABA (app compartilhado entre sistemas) — a URL precisa responder ao handshake com esse verify_token.

Altera configuração na Meta: exige confirm=true depois de o usuário concordar. Repetir é inofensivo.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `waba_id` | não | WABA ID da API (o da URL de Configurações do negócio → Contas do WhatsApp). Se omitido, usa META_WABA_ID. |
| `override_callback_uri` | não | Callback HTTPS só para esta WABA (opcional) |
| `verify_token` | não | Verify token do override_callback_uri (obrigatório com ele). Não é segredo da Meta, mas não o exiba à toa. |
| `confirm` | sim | Precisa ser true, depois de o usuário concordar. |

## wa_send_template_test

**Enviar template de teste (envia de verdade)**

ENVIA uma mensagem real de template pelo número e pode gerar cobrança. Use só na fase 'primeiro-envio', para um contato seu, depois de wa_diagnose sem FAIL.

Exige confirm=true e o destinatário explícito (somente dígitos com DDI, ex.: 5511999999999). O padrão é hello_world / en_US. Devolve o wamid; a entrega real aparece no webhook de status (erros como 131037 e 131042 só aparecem lá).

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `to` | sim | Destinatário, ex.: 5511999999999 |
| `template_name` | não | Nome exato do template APPROVED |
| `language_code` | não | Idioma exato do template, ex.: en_US, pt_BR |
| `phone_number_id` | não | Phone Number ID (não é o telefone). Se omitido, usa META_PHONE_NUMBER_ID. |
| `confirm` | sim | Precisa ser true. O agente só deve passar true depois de o usuário confirmar o destinatário e o envio. |

## wa_diagnose

**Diagnóstico completo do caminho**

Roda o checklist inteiro pela Graph API (somente leitura): token, WABA, moeda, verificação da empresa, números (status, nome de exibição, plataforma), webhook e templates. Devolve ✅/⚠️/❌ por item e a PRÓXIMA FASE do caminho que precisa de atenção.

É a ferramenta para "em que ponto estou?" e "por que a mensagem não sai/chega?". Se waba_id for omitido, usa META_WABA_ID ou a única WABA que o token enxerga. Não verifica forma de pagamento (a API não expõe): confira no billing hub.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `waba_id` | não | WABA ID da API (o da URL de Configurações do negócio → Contas do WhatsApp). Se omitido, usa META_WABA_ID. |
| `response_format` | não | 'markdown' para leitura, 'json' para dados estruturados |
