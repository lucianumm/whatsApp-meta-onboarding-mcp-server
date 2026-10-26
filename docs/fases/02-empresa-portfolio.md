<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 2 — Portfólio empresarial e Verificação da empresa

`#portfolio` `#irreversivel`

**Objetivo:** Ter um portfólio (Business Manager) verificado, dono dos ativos de WhatsApp.

## Passos
1. **[VOCÊ]** business.facebook.com → Configurações do negócio: criar ou escolher o portfólio da empresa.
2. **[VOCÊ]** Central de Segurança → Verificação da empresa: enviar os documentos (razão social, CNPJ, site, telefone comercial) e esperar a decisão (horas a dias).
3. **[JUNTOS]** Anote o ID do portfólio (business_id na URL). Ele é público, não é segredo.

## Como saber que terminou
- [ ] business_verification_status = verified na WABA. _(ferramenta: `wa_check_waba`)_

## Armadilhas
- `vivido` **Campos de Razão social / Endereço / Telefone ficam bloqueados para edição.**
  - Causa: A verificação está 'Em análise'.
  - O que fazer: Só esperar a Meta. Não há atalho.
- `vivido` **'Conta do WhatsApp Business não verificada' ao registrar o número (POST /{phone_id}/register).**
  - Causa: Verificação da empresa ainda pendente.
  - O que fazer: Esperar a aprovação e repetir o registro.
- `vivido` **Central de Segurança mostra 'WhatsApp needs more information / Informações adicionais necessárias' e o botão abre uma conta que você não consegue acessar.**
  - Causa: A verificação ficou apontando para uma WABA criada e perdida durante o processo (conta fantasma). Não é banimento nem restrição do portfólio.
  - O que fazer: Não apague o portfólio. Crie uma conta de WhatsApp real dentro dele (fase 'conta-e-numero'); com uma conta real o item passa a mostrar o que falta.
- `vivido` **Existem vários portfólios e várias WABAs com nome igual ou parecido.**
  - Causa: O processo de verificação/cadastro foi rodado mais de uma vez; a Meta cria contas a cada tentativa.
  - O que fazer: Sempre confira pelo ID, nunca pelo nome. Excluir portfólio é permanente e pode jogar fora a verificação do CNPJ — não faça para 'recomeçar limpo'.

➡️ Próxima fase: [`app-meta`](03-app-meta.md)
