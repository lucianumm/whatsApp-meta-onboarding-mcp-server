<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 5 — Os IDs certos (a maior fonte de confusão)

`#ids` `#waba`

**Objetivo:** Saber qual ID é qual e ter WABA ID e Phone Number ID corretos no sistema.

## Passos
1. **[JUNTOS]** WABA ID da API: está na URL de Configurações do negócio → Contas do WhatsApp (selected_asset_id). É o que a Graph API aceita em /{waba_id}/…
2. **[JUNTOS]** O seletor de contas do Gerenciador do WhatsApp mostra OUTRO número: o da 'conta de mensagens' (onde ficam os modelos). Não use esse como WABA ID.
3. **[JUNTOS]** Phone Number ID: Gerenciador do WhatsApp → Números de telefone → engrenagem do número → 'Identificação do número de telefone'. Ou via API.
4. **[AUTOMÁTICO]** Com um token válido, deixe o MCP descobrir tudo sozinho (wa_discover_ids): ele lê as contas a que o token tem acesso e lista os números de cada uma.

## Como saber que terminou
- [ ] Um GET /{waba_id} responde com o nome certo. _(ferramenta: `wa_check_waba`)_

## Armadilhas
- `vivido` **Erro #100 'Object with ID … does not exist, cannot be loaded due to missing permissions, or does not support this operation'.**
  - Causa: Quase sempre ID trocado (ID do Gerenciador no lugar do WABA ID) ou Usuário do Sistema sem acesso àquela conta.
  - O que fazer: Rode wa_discover_ids. Se a conta não aparece, atribua-a ao Usuário do Sistema (fase 'usuario-sistema-token').
- `vivido` **A mesma conta responde por dois IDs (o 'WABA ID' e o da 'conta de mensagens'); o health_status do número cita um, o sistema usa outro.**
  - Causa: Os dois são aliases da mesma conta: ambos listam o mesmo número em /phone_numbers. Mas subscribed_apps é por ID: assinar em um deixa o outro vazio, e a Meta roteia status e mensagens recebidas pelo ID que o health_status aponta.
  - O que fazer: Compare o ID da entidade WABA em GET /{phone_number_id}?fields=health_status com o seu META_WABA_ID (o wa_diagnose faz). Se diferirem, assine o app nos dois IDs.
- `vivido` **Vejo várias contas com o mesmo nome e não sei qual é.**
  - Causa: Várias WABAs homônimas (resíduo do processo de verificação).
  - O que fazer: Procure a que tem o número dentro, pelo ID. A API só enxerga as WABAs atribuídas ao usuário do token; para as demais só o navegador logado como administrador.

➡️ Próxima fase: [`usuario-sistema-token`](06-usuario-sistema-token.md)
