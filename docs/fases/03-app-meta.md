<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 3 — App no Meta for Developers

`#app` `#seguranca`

**Objetivo:** Ter um app publicado, ligado ao portfólio, com o caso de uso de WhatsApp — e um app por sistema.

## Passos
1. **[VOCÊ]** developers.facebook.com/apps → Criar app, caso de uso 'Conectar-se com clientes pelo WhatsApp', vinculado ao portfólio.
2. **[VOCÊ]** Configurações → Básico: preencher a URL da política de privacidade (sem ela o botão Publicar não libera).
3. **[VOCÊ]** Publicar o app (modo 'Ao vivo').
4. **[VOCÊ]** Anote o App ID. A 'Chave secreta' (App Secret) fica em Configurações → Básico → Mostrar (a Meta pede a sua senha) e só você a copia.
5. **[JUNTOS]** Para os ativos do próprio negócio o Acesso Padrão basta; Acesso Avançado (Análise do app) só é necessário para operar portfólios de terceiros.

## Como saber que terminou
- [ ] App aparece como 'Ao vivo' e o App ID está anotado.

## Armadilhas
- `vivido` **Mensagens de um sistema caem na caixa de outro.**
  - Causa: O webhook do WhatsApp é configurado por APP. Dois sistemas no mesmo app disputam a mesma URL de callback.
  - O que fazer: Um app por sistema, cada um com o seu callback. Se precisar compartilhar o app, use override_callback_uri por WABA (fase 'webhook') e nunca troque o callback do app.
- `vivido` **O 'Token do Cliente' (32 caracteres) não funciona como token de acesso — 'Cannot parse access token'.**
  - Causa: É outro objeto, usado só por SDKs client-side.
  - O que fazer: Use o token de Usuário do Sistema (fase 'usuario-sistema-token').
- `vivido` **Permissão business_management reprovada na Análise do app.**
  - Causa: Ela só dá Acesso Avançado para portfólios de terceiros.
  - O que fazer: Para operar só o próprio número não bloqueia nada; as permissões de WhatsApp aprovadas bastam.
- `vivido` **O MCP oficial da Meta (mcp.facebook.com/devtools) não traz Phone Number ID nem nada de WhatsApp.**
  - Causa: Segundo a documentação dele, cobre app, análise, conformidade e webhooks — não números, WABAs, templates nem tokens.
  - O que fazer: Use as ferramentas wa_* deste MCP (Graph API direta) para o que é de WhatsApp.

➡️ Próxima fase: [`conta-e-numero`](04-conta-e-numero.md)
