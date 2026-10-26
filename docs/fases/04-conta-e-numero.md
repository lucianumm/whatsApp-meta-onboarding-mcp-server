<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 4 — Conta do WhatsApp (WABA) e número — inclusive o virtual

`#waba` `#numero-virtual` `#cloud-api`

**Objetivo:** Ter uma WABA no portfólio e um número com status Conectado.

## Passos
1. **[VOCÊ]** Configurações do negócio → Contas do WhatsApp → Adicionar. Há três opções: 'Criar conta do WhatsApp', 'Solicitar conta para um cliente' e 'Vincular conta existente'. Para o seu negócio: Criar.
2. **[VOCÊ]** O assistente 'Create your WhatsApp profile' tem 4 passos: Detalhes → Telefone → Verificação do telefone → Messaging accounts.
3. **[VOCÊ]** Detalhes: nome de exibição (escreva 'Minha Empresa', não 'MINHA EMPRESA') e categoria da empresa.
4. **[VOCÊ]** Telefone: um número seu (verificado por SMS/ligação na etapa seguinte) ou, quando a Meta oferece, um número virtual fornecido pelo próprio WhatsApp (foi o caso de números +1 711-…). A tela exata pode variar.
5. **[VOCÊ]** Terminado, o número aparece como 'Conectado' e o nome de exibição como 'Em análise'.
6. **[JUNTOS]** Número próprio no caminho B: se o painel não registrar sozinho, registre com POST /{phone_number_id}/register {messaging_product:'whatsapp', pin:'<6 dígitos>'} — o PIN vira a verificação em duas etapas, guarde-o. NUNCA faça isso no caminho C (coexistência): lá o número já é registrado pelo app.
7. **[AUTOMÁTICO]** Confira pela API: status, code_verification_status, platform_type e name_status.

## Como saber que terminou
- [ ] status = CONNECTED e platform_type = CLOUD_API. _(ferramenta: `wa_list_phone_numbers`)_
- [ ] name_status: APPROVED libera envio; PENDING_REVIEW → erro 131037 até a Meta aprovar. _(ferramenta: `wa_list_phone_numbers`)_

## Armadilhas
- `vivido` **No passo Telefone: 'Conta com restrição — sua conta do WhatsApp Business está restrita no momento'.**
  - Causa: A conta de WhatsApp à qual o fluxo está ligado (não o número, não o portfólio) está restrita. No caso real era uma WABA fantasma da verificação.
  - O que fazer: Só a Meta tira a restrição. O chat de suporte classificou como 'Ativo desabilitado ou restrito' mas só a IA respondeu e se recusou a transferir. O que destravou depois não ficou identificado: horas depois uma WABA nova foi criada normalmente no mesmo portfólio. Tente de novo, em outro momento, antes de escalar.
- `vivido` **Nome de exibição rejeitado ou 'Verificação adicional necessária'.**
  - Causa: Nome todo em maiúsculas, nome que não bate com a empresa/site, ou nome genérico.
  - O que fazer: Use o nome comercial com capitalização normal e coerente com o site/CNPJ.
- `vivido` **Envio falha com 131037 logo após criar o número.**
  - Causa: O número fornecido pelo WhatsApp precisa da aprovação do nome de exibição antes de enviar.
  - O que fazer: Esperar. Só a Meta libera. Acompanhe name_status e reenvie o teste depois.
- `vivido` **O celular não abre conversa com o número +1 711-… (hipótese, não confirmada).**
  - Causa: 711 não é código de área comum (é código de serviço); o app pode recusar o número como destino.
  - O que fazer: Teste https://wa.me/<numero> no celular. Se não abrir, a conversa precisa começar pela empresa (template aprovado); o cliente responde pelo chat que já existe.
- `vivido` **code_verification_status = EXPIRED com status CONNECTED.**
  - Causa: Só o último código de verificação caducou.
  - O que fazer: Nada. Não afeta envio nem recebimento de número já registrado.
- `doc-meta` **Não consigo excluir o número da WABA.**
  - Causa: Número que enviou mensagens pagas nos últimos 30 dias não pode ser excluído; só administrador exclui.
  - O que fazer: Aguardar os 30 dias ou manter o número onde está.
- `vivido` **Templates sumiram depois de excluir/recriar a WABA.**
  - Causa: Templates pertencem à WABA e não migram. Excluir a WABA (ACCOUNT_DELETED) apaga o que estava nela.
  - O que fazer: Recrie os templates na nova WABA (fase 'templates').

➡️ Próxima fase: [`ids`](05-ids.md)
