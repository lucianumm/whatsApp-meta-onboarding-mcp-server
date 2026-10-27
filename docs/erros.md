<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Catálogo de erros



`vivido` = aconteceu na prática; `doc-meta` = documentação pública da Meta (confirme na tela).



## #131037 — Nome de exibição precisa de aprovação
`vivido` `#numero-virtual` `#envio`
- **Significa:** O número fornecido pelo WhatsApp (virtual) só pode enviar depois que a Meta aprovar o nome de exibição.
- **O que fazer:** Aguardar. Confira name_status com wa_list_phone_numbers e reenvie o teste quando virar APPROVED. Só a Meta libera.
- **Fase relacionada:** `conta-e-numero`

## #131042 — Problema de elegibilidade de pagamento
`vivido` `#faturamento` `#envio`
- **Significa:** WABA sem moeda definida ou sem forma de pagamento. Dentro da janela de 24h iniciada pelo cliente funciona; template iniciado pela empresa não.
- **O que fazer:** Billing hub: definir país/moeda (irreversível) e cadastrar o cartão (você digita). Para testar sem cartão, escreva para o número e responda dentro da janela.
- **Fase relacionada:** `faturamento`

## #141006 — Erro no método de pagamento (saúde do número)
`vivido` `#faturamento`
- **Significa:** Aparece na saúde do número e bloqueia conversas iniciadas pela empresa. A API ainda ACEITA o envio e devolve o wamid (a mensagem fica 'enviada'); a recusa vem depois, só pelo webhook de status.
- **O que fazer:** Cadastrar ou corrigir a forma de pagamento no billing hub (você digita o cartão). Confira com wa_list_phone_numbers / wa_diagnose até o can_send_message da WABA voltar a AVAILABLE e então envie de novo: o que foi aceito durante o bloqueio não é reentregue.
- **Fase relacionada:** `faturamento`

## #3441034 — Número não se qualifica para registro ou migração
`vivido` `#coexistencia`
- **Significa:** O fluxo padrão de cadastro reclamando que o número já existe na Cloud API. NÃO prova que o número é inelegível para Coexistência.
- **O que fazer:** Escolher a porta certa: registro padrão exige número livre; Coexistência exige número ativo só no app.
- **Fase relacionada:** `coexistencia`

## #2200 — Falha na verificação do callback (DNS)
`vivido` `#webhook`
- **Significa:** A Meta não resolveu o seu domínio naquele instante. Quase sempre transitório.
- **O que fazer:** Confirme com curl que o handshake devolve o hub.challenge e repita a assinatura.
- **Fase relacionada:** `webhook`

## #200 — Permissão negada ao listar/criar templates
`vivido` `#token` `#templates`
- **Significa:** O Usuário do Sistema não tem 'Modelos de mensagem' na conta de mensagens da WABA.
- **O que fazer:** Contas do WhatsApp → conta de mensagens → Atribuir pessoas → Modelos de mensagem (ver e gerenciar).
- **Fase relacionada:** `usuario-sistema-token`

## #100 — Objeto inexistente ou sem permissão
`vivido` `#ids` `#token`
- **Significa:** Quase sempre WABA ID trocado (ID do Gerenciador no lugar do ID da API) ou Usuário do Sistema sem acesso a essa conta. Também aparece para campo inválido.
- **O que fazer:** Rode wa_discover_ids para ver os IDs que o token enxerga. Se a conta não aparece, atribua-a ao Usuário do Sistema.
- **Fase relacionada:** `ids`

## #190 — Token expirado ou inválido
`vivido` `#token`
- **Significa:** Token de usuário comum expira em horas; 'Cannot parse access token' costuma ser o Token do Cliente (32 caracteres) colado no lugar do token de acesso.
- **O que fazer:** Gerar token de Usuário do Sistema com 'Nunca expira' e validar com wa_check_token.
- **Fase relacionada:** `usuario-sistema-token`

## #132012 — Formato do parâmetro não confere (ex.: imagem do cabeçalho)
`vivido` `#templates` `#envio`
- **Significa:** Caso vivido: template com cabeçalho de imagem disparado sem reenviar a mídia. O header_handle da criação só vale para a aprovação.
- **O que fazer:** Mande o componente header com a imagem em todo envio; confira os demais parâmetros do template.
- **Fase relacionada:** `templates`

## #10 — Sem permissão granular para enviar nesta WABA (#10)
`vivido` `#token` `#envio`
- **Significa:** Caso vivido: o token tem o escopo whatsapp_business_messaging, mas o Usuário do Sistema não foi atribuído à WABA com controle de mensagens. Só 'Modelos de mensagem' (que basta para sincronizar templates) não permite enviar. O envio falha na hora, sem wamid.
- **O que fazer:** Configurações do negócio → Usuários do sistema → Adicionar ativos → Contas do WhatsApp → marque a WABA e dê Controle total (ou Números + Mensagens). Gere o token de novo no mesmo usuário, com whatsapp_business_messaging e whatsapp_business_management, e cole no sistema. Valide com wa_check_token (granular_scopes deve listar a WABA nos dois escopos).
- **Fase relacionada:** `usuario-sistema-token`

## #10 — Campo exclusivo de BSP pedido a uma WABA comum (#10)
`vivido` `#faturamento` `#ids`
- **Significa:** Caso vivido: GET /{waba_id} com campos como primary_funding_id pode responder 'esta ação exige que o negócio dono do app seja Business Solution Provider'. Não é falta de permissão do seu token.
- **O que fazer:** Não dá para ler forma de pagamento pela API. Leia a saúde pelo NÚMERO: GET /{phone_number_id}?fields=health_status (traz can_send_message por entidade, com o erro de cada uma, como 141006). O wa_diagnose já faz isso.
- **Fase relacionada:** `faturamento`

## Nenhum aviso de status/mensagem chega, mas a WABA 'está assinada'
`vivido` `#webhook` `#ids`
- **Significa:** Caso vivido: a mesma conta aparece com dois IDs (o da API e o 'conta de mensagens' do Gerenciador), ambos listam o mesmo número. O app estava inscrito em um deles; a Meta roteia status e mensagens recebidas pelo outro (o que aparece na entidade WABA do health_status do número). O campo 'messages' e o callback do app podem estar corretos e ainda assim nada chega.
- **O que fazer:** Rode wa_diagnose: ele compara o ID da entidade WABA em health_status com o configurado. Inscreva o app em AMBOS os IDs (wa_subscribe_webhooks para cada um) e confira wa_check_webhook nos dois. Depois mande uma mensagem nova: eventos passados não são reentregues.
- **Fase relacionada:** `webhook`

## Conta do WhatsApp Business com restrição
`vivido` `#waba` `#suporte`
- **Significa:** A WABA à qual o fluxo está ligado está restrita (não é o número nem o portfólio). Caso real: WABA fantasma criada durante a verificação.
- **O que fazer:** Não apague o portfólio. Tente criar a conta de novo mais tarde; o suporte automático da Meta não transfere para humano (fase 'suporte-meta').
- **Fase relacionada:** `conta-e-numero`

## Registro do número bloqueado: empresa não verificada
`vivido` `#portfolio` `#cloud-api`
- **Significa:** A Verificação da empresa ainda está 'Em análise'.
- **O que fazer:** Esperar a aprovação e repetir o POST /{phone_id}/register.
- **Fase relacionada:** `empresa-portfolio`

## Login sem acesso à conta no Gerenciador do WhatsApp
`vivido` `#ids` `#waba`
- **Significa:** O login atual não tem a conta atribuída (ou a conta é uma WABA fantasma).
- **O que fazer:** Atribuir a pessoa na conta, ou abrir o Gerenciador sem informar ID e escolher a conta no seletor.
- **Fase relacionada:** `ids`

## Template não pode ser editado
`vivido` `#templates`
- **Significa:** Só templates REJECTED são editáveis.
- **O que fazer:** Apague (qualquer status) e recrie.
- **Fase relacionada:** `templates`

## 'WhatsApp needs more information' na Central de Segurança
`vivido` `#portfolio`
- **Significa:** Pendência de informações do WhatsApp; no caso real apontava para uma WABA inacessível. Não é banimento.
- **O que fazer:** Criar uma conta real de WhatsApp no portfólio e ver o que a Meta pede.
- **Fase relacionada:** `empresa-portfolio`

## code_verification_status = EXPIRED
`vivido` `#waba`
- **Significa:** Só o último código de verificação caducou. Com status CONNECTED, não afeta envio nem recebimento.
- **O que fazer:** Nada a fazer.
- **Fase relacionada:** `conta-e-numero`

## Popup mostra o cadastro padrão em vez da Coexistência
`vivido` `#coexistencia`
- **Significa:** A variação de Coexistência não foi oferecida (porta errada, parâmetros, ou bloqueio do lado da Meta).
- **O que fazer:** PARE antes de digitar o número (seria registrado só na Cloud API). Veja a fase 'coexistencia'.
- **Fase relacionada:** `coexistencia`

## #131047 — Janela de 24h fechada
`doc-meta` `#envio` `#templates`
- **Significa:** O cliente não escreveu nas últimas 24h; texto livre não é permitido.
- **O que fazer:** Enviar um template aprovado.
- **Fase relacionada:** `templates`

## #131030 — Destinatário fora da lista permitida
`doc-meta` `#envio`
- **Significa:** Típico do número de TESTE da Meta: só envia para destinatários cadastrados.
- **O que fazer:** Cadastrar o destinatário no app ou usar número de produção.
- **Fase relacionada:** `escolher-caminho`

## #131026 — Mensagem não entregável
`doc-meta` `#envio`
- **Significa:** O destinatário não está no WhatsApp, não aceitou os termos ou está com versão antiga. Texto genérico: procure code/title/error_data.details no webhook.
- **O que fazer:** Conferir o número e tentar outro destinatário conhecido.
- **Fase relacionada:** `webhook`

## #131060 — Mensagens incompatíveis (coexistência)
`doc-meta` `#coexistencia`
- **Significa:** Esperado na primeira mensagem de um usuário e com dispositivos adicionais incompatíveis.
- **O que fazer:** Não é falha.
- **Fase relacionada:** `coexistencia`

## #2593109 — Histórico não compartilhado (coexistência)
`doc-meta` `#coexistencia`
- **Significa:** A empresa recusou compartilhar o histórico no onboarding; chega um webhook history com esse erro.
- **O que fazer:** Seguir sem histórico ou refazer o onboarding.
- **Fase relacionada:** `coexistencia`

## #131031 — Conta bloqueada
`doc-meta` `#waba` `#suporte`
- **Significa:** A conta de WhatsApp foi bloqueada pela Meta.
- **O que fazer:** Verificar o Gerenciador do WhatsApp e abrir revisão com a Meta.

## #131056 — Limite entre o par remetente/destinatário
`doc-meta` `#envio`
- **Significa:** Muitas mensagens para o mesmo destinatário em pouco tempo.
- **O que fazer:** Espaçar os envios.

## #130429 — Limite de taxa (throughput)
`doc-meta` `#envio`
- **Significa:** Envios mais rápidos que o permitido pelo número (20 mps em coexistência).
- **O que fazer:** Reduzir a taxa; implementar fila com recuo.

## #132000 — Quantidade de parâmetros do template não confere
`doc-meta` `#templates` `#envio`
- **Significa:** O envio trouxe mais ou menos variáveis do que o template define.
- **O que fazer:** Conferir as variáveis {{1}}, {{2}}… do template.
- **Fase relacionada:** `templates`

## #132001 — Template ou idioma inexistente
`doc-meta` `#templates` `#envio`
- **Significa:** Nome ou código de idioma não existem NAQUELA WABA (templates não se movem entre WABAs).
- **O que fazer:** Listar com wa_list_templates e usar nome e idioma exatos.
- **Fase relacionada:** `templates`

## #133010 — Número não registrado na Cloud API
`doc-meta` `#cloud-api` `#waba`
- **Significa:** O número existe na WABA mas não foi registrado (POST /{phone_id}/register).
- **O que fazer:** Registrar o número com PIN de 6 dígitos (exige empresa verificada). Não se aplica à coexistência.
- **Fase relacionada:** `conta-e-numero`
