<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 11 — Coexistência — tudo o que confirmamos (apêndice)

`#coexistencia` `#irreversivel`

**Objetivo:** Evitar semanas perdidas: o que a Coexistência realmente exige, como implementar o fim do fluxo e como ela falha.

## Passos
1. **[VOCÊ]** Pré-condições da documentação: ser Provedor de Tecnologia ou Solution Partner; Análise do app concluída; Cadastro Incorporado com session logging; webhook funcionando; app WhatsApp Business 2.24.17+; número registrado SÓ no app WhatsApp Business (fora de qualquer WABA/Cloud API).
2. **[VOCÊ]** Painel do app → Login do Facebook para Empresas → Configurações → Criar do modelo 'Configuração do cadastro incorporado do WhatsApp com token de expiração em 60 dias' (gera o config_id). Em Configurações gerais: 'Entrar com o SDK do JavaScript' = Sim e o seu domínio HTTPS em 'Domínios permitidos'.
3. **[JUNTOS]** Assinar no app, além de 'messages': smb_message_echoes (o que a equipe digita no celular), history (histórico) e smb_app_state_sync (contatos). Via POST /{app_id}/subscriptions com token de app; preserve os campos que já existem.
4. **[JUNTOS]** FB.login com os extras que o Configurador de cadastro incorporado gera (fonte da verdade, não a doc): featureType 'whatsapp_business_app_onboarding', sessionInfoVersion '3', version 'v4'. A versão 2 do Cadastro Incorporado foi descontinuada em 15/10/2026.
5. **[VOCÊ]** No popup: informar o número, receber o código, TOCAR em 'Conectar à Plataforma de Negócios' no app do celular e colar o código. Não é QR Code. Não cadastre o número de novo nem crie PIN.
6. **[AUTOMÁTICO]** Fim do fluxo no servidor: trocar o code pelo token (expira em 60 dias, a menos que você use um token permanente de Usuário do Sistema que enxergue o número); descobrir WABA e número pelo próprio token (debug_token → granular_scopes → /phone_numbers), casando o telefone com e sem nono dígito; gravar os IDs; inscrever a WABA; conectar.
7. **[AUTOMÁTICO]** Sincronização: POST /{phone_number_id}/smb_app_data com sync_type 'smb_app_state_sync' (contatos) e depois 'history'. CADA UM SÓ UMA VEZ e dentro de 24 h do fim do cadastro — refazer exige offboarding e o fluxo inteiro de novo. Guarde o request_id de cada um.
8. **[JUNTOS]** history: até 180 dias em 3 fases, em partes fora de ordem (ordenar por chunk_order; progress 100 = fim), um webhook pode ter milhares de mensagens (capture e processe assíncrono), mídia vem como media_placeholder (id só para mídias dos últimos 14 dias), grupos não entram, recusa de compartilhar chega como erro 2593109.
9. **[AUTOMÁTICO]** Prova oficial: GET /{phone_number_id}?fields=is_on_biz_app,platform_type → is_on_biz_app=true + CLOUD_API (wa_check_coexistence). Prova prática: mensagem digitada no app aparece no sistema (eco smb_message_echoes).
10. **[VOCÊ]** Depois de ativa: abra o app no celular ao menos a cada ~2 semanas (sem uso a Meta desconecta). Para sair: no app, Configurações → Conta → Plataforma comercial → Desconectar conta (gera account_update PARTNER_REMOVED); não use a API de descadastro.

## Como saber que terminou
- [ ] is_on_biz_app = true e platform_type = CLOUD_API. _(ferramenta: `wa_check_coexistence`)_
- [ ] Mensagem digitada no app do celular aparece no sistema.
- [ ] Os dois smb_app_data aceitos, com request_id guardado.

## Armadilhas
- `vivido` **Erro #3441034 'Este número não se qualifica para registro ou migração'.**
  - Causa: É o fluxo PADRÃO reclamando que o número já existe. Não prova inelegibilidade.
  - O que fazer: Use a porta certa (número só no app) ou aceite o caminho A.
- `vivido` **Mesmo com tudo cumprido, a tela é sempre a padrão ('Adicione seu número / Você não tem nenhum número existente').**
  - Causa: Em ago–out/2026 a Meta nunca ofereceu a variação ao app, com parâmetros idênticos aos do configurador (confirmado interceptando o window.open). A IA do suporte disse que a habilitação seria um 'processo manual' da Meta, que nunca foi executado.
  - O que fazer: Não insista em parâmetros: já foram todos eliminados. Opções: suporte (fase 'suporte-meta'), BSP que já ofereça coexistência, ou o caminho A (número novo só para disparos). Pare ANTES de digitar o número no fluxo padrão — ele seria registrado só na Cloud API e sairia do app.
- `vivido` **A página hospedada da Meta (business.facebook.com/messaging/whatsapp/onboard/?app_id=…&config_id=…&extras=…) abre o fluxo antigo.**
  - Causa: Ela reescreve os extras: você manda version 'v4' e o diálogo abre com 'v3' + is_hosted_es, e a v3 ignora a coexistência.
  - O que fazer: Prefira o JS SDK (FB.login) num domínio HTTPS permitido.
- `vivido` **O popup do SDK não abre ou recusa em http://localhost.**
  - Causa: O JS SDK só funciona em domínio HTTPS listado em 'Domínios permitidos para o SDK do JavaScript'.
  - O que fazer: Rode o fluxo no domínio público do sistema; em uso só local, a página hospedada é a alternativa (com a ressalva da v3).
- `vivido` **O app compartilhado manda os eventos de um número para o sistema errado.**
  - Causa: Com o callback do app apontando para outro sistema, assinar webhooks na WABA nova desvia mensagens.
  - O que fazer: Relay próprio + override_callback_uri na inscrição da WABA; filtre eventos pelo Phone Number ID.
- `doc-meta` **Depois de ativar: listas de transmissão viraram só leitura, aparelhos foram desconectados, grupos não aparecem no sistema.**
  - Causa: Efeitos documentados da coexistência: listas de transmissão desativadas; mensagens temporárias, visualização única e localização ao vivo desativadas; aparelhos vinculados desconectados (WhatsApp para Windows e WearOS incompatíveis); grupos, ligações, catálogo e rótulos não passam pela API; vazão fixa de 20 mps.
  - O que fazer: Decida antes. Ganho: editar/apagar mensagem passa a ser possível, e mensagens enviadas pelo app não abrem nem cobram janela da Cloud API.
- `doc-meta` **Erro 131060 na primeira mensagem de um usuário.**
  - Causa: Esperado com dispositivos adicionais incompatíveis.
  - O que fazer: Não é falha.

➡️ Próxima fase: [`suporte-meta`](12-suporte-meta.md)
