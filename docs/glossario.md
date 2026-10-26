<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Glossário

- **Portfólio empresarial (Business Manager):** Container de ativos da empresa. Tem um business_id (visível na URL). É ele que passa pela Verificação da empresa.
- **WABA (conta do WhatsApp Business):** Conta que contém números e templates. O WABA ID aceito pela Graph API está na URL de Configurações do negócio → Contas do WhatsApp (selected_asset_id).
- **Conta de mensagens:** A 'face' da WABA no Gerenciador do WhatsApp; o ID mostrado no seletor do Gerenciador é DIFERENTE do WABA ID da API. Modelos são geridos aqui.
- **Phone Number ID:** ID do número dentro da WABA. É o usado em POST /{phone_number_id}/messages. Não é o telefone.
- **Cloud API:** API oficial hospedada pela Meta. O número fica registrado nela (não no app do celular).
- **Número virtual / fornecido pelo WhatsApp:** Número que a própria Meta fornece ao criar a conta; precisa de aprovação do nome de exibição antes de enviar (131037).
- **Usuário do Sistema:** Identidade técnica do portfólio. Gera tokens que não dependem de uma pessoa. Papel Employee com ativos atribuídos já basta.
- **Token permanente:** Token de Usuário do Sistema com validade 'Nunca expira' (debug_token: type SYSTEM_USER, expires_at 0).
- **Janela de 24h:** Depois que o cliente escreve, a empresa pode responder com texto livre por 24h. Fora dela, só template aprovado.
- **Template (modelo):** Mensagem pré-aprovada pela Meta para iniciar conversas. Pertence à WABA e não migra.
- **Tier de mensagens:** Limite de contatos novos únicos por 24h: 50 → 250 → 1 mil → 10 mil → 100 mil → ilimitado (messaging_limit_tier).
- **Relay / túnel:** Peça que recebe o webhook da Meta numa URL pública HTTPS e repassa ao sistema (VPS+Caddy ou Cloudflare Tunnel).
- **override_callback_uri:** Callback próprio de uma WABA, informado na inscrição POST /{waba_id}/subscribed_apps. Permite dividir um app entre sistemas sem trocar o callback do app.
- **App Secret (Chave secreta):** Segredo do app; assina cada webhook (HMAC). Só o dono copia e cola.
- **Cadastro Incorporado (Embedded Signup):** Popup da Meta (FB.login com config_id) que conecta um número a um app. É a porta de entrada da Coexistência.
- **Coexistência:** Mesmo número no app WhatsApp Business e na Cloud API. Prova oficial: is_on_biz_app=true + platform_type=CLOUD_API.
- **smb_app_data:** API que dispara, UMA vez cada, a sincronização de contatos (smb_app_state_sync) e histórico (history) da coexistência, em até 24h.
