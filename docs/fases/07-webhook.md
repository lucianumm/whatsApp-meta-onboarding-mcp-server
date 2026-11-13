<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 7 — Webhook: receber mensagens e status

`#webhook` `#seguranca`

**Objetivo:** A Meta consegue entregar eventos no seu sistema, com assinatura verificada.

## Passos
1. **[VOCÊ]** Tenha uma URL pública HTTPS. Opções que funcionaram: VPS + Caddy + relay; ou Cloudflare Tunnel com hostname fixo expondo SÓ a rota do webhook (todo o resto responde 403).
2. **[JUNTOS]** No servidor: GET devolve hub.challenge se hub.verify_token bater; POST valida X-Hub-Signature-256 (HMAC-SHA256 do corpo cru com o App Secret) e rejeita o que não bater.
3. **[VOCÊ]** No app: WhatsApp → Configuração (ou Webhooks → objeto 'WhatsApp Business Account'): informar URL de callback + verify token e 'Verificar e salvar'; assinar o campo 'messages' (traz mensagens recebidas e status).
4. **[AUTOMÁTICO]** Inscrever o app na WABA: POST /{waba_id}/subscribed_apps (wa_subscribe_webhooks). Confira com wa_check_webhook; com META_APP_ID + META_APP_SECRET, wa_check_app_webhook mostra a URL de callback e os campos assinados.
5. **[JUNTOS]** App compartilhado entre sistemas: em vez de trocar o callback do app, inscreva a WABA com override_callback_uri + verify_token próprios (o callback passa a valer só para aquela WABA).
6. **[VOCÊ]** Teste: em 'Testar' do campo messages, 'Enviar para servidor'. Depois mande uma mensagem real.

## Como saber que terminou
- [ ] subscribed_apps lista o seu app. _(ferramenta: `wa_check_webhook`)_
- [ ] Callback e campo 'messages' assinados no app. _(ferramenta: `wa_check_app_webhook`)_
- [ ] Uma mensagem real aparece nos eventos do servidor.

## Armadilhas
- `vivido` **Mensagem enviada ao número 'não chegou no sistema' e o log mostra 0 eventos.**
  - Causa: O webhook do app estava sem URL de callback, sem verify token e sem campos assinados — a Meta não tinha para onde entregar.
  - O que fazer: Configurar callback, verify token e assinar 'messages'; inscrever a WABA. Mensagens antigas não são reentregues.
- `vivido` **Teste 'Enviar para servidor' é recebido, validado e descartado.**
  - Causa: O exemplo da Meta usa um phone number ID fictício (123456123); o sistema corretamente ignora o que não é do seu número.
  - O que fazer: Não é defeito. Prove com mensagem real.
- `vivido` **(#2200) Callback verification failed … DNS resolution timed out.**
  - Causa: A Meta não conseguiu resolver o hostname do callback. Pode ser transitório; se persistir, o DNS ou a rota pública desse hostname pode estar inacessível à Meta mesmo que funcione no computador local.
  - O que fazer: Confirme DNS, HTTPS e o handshake pelo hostname público. Se continuar falhando, use um hostname HTTPS estável que a Meta alcance e encaminhe apenas a rota do webhook ao relay; depois valide o callback de novo.
- `vivido` **A WABA lista o app em subscribed_apps, mas o app não tem callback ou campo 'messages' assinado e nenhum evento chega.**
  - Causa: A inscrição da WABA e a configuração de webhook do app são etapas separadas; uma não cria a outra.
  - O que fazer: Confira no app a URL de callback, o verify token e a assinatura do campo 'messages'; depois confirme subscribed_apps na WABA e teste com uma mensagem nova.
- `vivido` **A API devolve ok mas a mensagem não entrega; o sistema só mostra 'Message undeliverable'.**
  - Causa: O erro real vem no webhook de STATUS, em errors[].code + title + error_data.details — guardar só o 'message' genérico esconde a causa.
  - O que fazer: Grave code/title/details do evento e guarde o corpo cru de cada webhook recebido (ex.: uma tabela de eventos no relay) para depurar.
- `vivido` **Callback verificado, campo 'messages' assinado, wa_check_webhook ok — e mesmo assim zero eventos (nem 'delivered' nem mensagens recebidas).**
  - Causa: O app estava inscrito só em um dos dois IDs da mesma conta; a Meta entrega pelo outro, que ficou com subscribed_apps vazio.
  - O que fazer: Assine o app também no ID que o health_status do número aponta (wa_diagnose mostra a diferença) e teste com mensagem nova.
- `vivido` **Eventos são recusados por assinatura — especialmente depois de substituir o app.**
  - Causa: O relay ainda validava a assinatura com o App Secret do app anterior, ou o segredo estava ausente; o HMAC da Meta só confere com o App Secret do app que envia o webhook.
  - O que fazer: Atualize o App Secret do app ativo em cada receptor/relay que valida X-Hub-Signature-256, recarregue o serviço e confirme o recebimento de um evento novo.
- `doc-meta` **Sistema ficou fora do ar e mensagens se perderam.**
  - Causa: A Meta reenvia por algumas horas e depois descarta.
  - O que fazer: Mantenha o receptor sempre ligado (serviço/túnel subindo com o sistema).

➡️ Próxima fase: [`faturamento`](08-faturamento.md)
