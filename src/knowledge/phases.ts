import type { Phase } from "./types.js";

/**
 * O caminho completo, na ordem em que funcionou. "lived: true" marca o que
 * aconteceu de verdade em implantações reais (jul–out/2026); o resto vem
 * da documentação pública da Meta e deve ser confirmado na tela.
 */
export const PHASES: Phase[] = [
  {
    id: "escolher-caminho",
    order: 1,
    title: "Escolher o caminho",
    goal: "Decidir como o número vai entrar na API oficial antes de gastar tempo em qualquer tela.",
    tags: ["cloud-api", "numero-virtual", "coexistencia"],
    steps: [
      {
        who: "voce",
        text:
          "Caminho A — número NOVO criado direto na conta do WhatsApp (inclui o número virtual fornecido pelo próprio WhatsApp). O número vive só na Cloud API, sem app no celular. É o caminho de quem quer DISPARAR. Foi o que funcionou.",
      },
      {
        who: "voce",
        text:
          "Caminho B — número que já existe, registro padrão na Cloud API. Exige o número livre de qualquer WhatsApp/WhatsApp Business; ele sai do app do celular.",
      },
      {
        who: "voce",
        text:
          "Caminho C — Coexistência (app do celular + API no mesmo número). Exige número ativo SÓ no app WhatsApp Business (2.24.17+), popup do Cadastro Incorporado e um toque no celular. Na prática a Meta não ofereceu a variação (ver fase 'coexistencia').",
      },
      { who: "voce", text: "Caminho D — número de teste da Meta (+1 555…). Só para desenvolver: destinatários precisam estar cadastrados e o número não serve de produção." },
      {
        who: "ambos",
        text:
          "Regra de bolso: quer disparar campanhas e não precisa do app no celular → A. Precisa responder pelo celular e pela API no mesmo número → C (e aceite que pode não ser oferecido; perde listas de transmissão e fica em 20 mps). Número antigo que pode sair do celular → B.",
      },
    ],
    checks: [{ text: "Você sabe qual caminho vai seguir e que ele é compatível com o estado atual do número." }],
    pitfalls: [
      {
        symptom: "Tela padrão 'Adicione seu número' em vez da tela de Coexistência.",
        cause: "As duas portas têm pré-condições opostas: registro padrão exige número livre; Coexistência exige número ativo no app. Não há parâmetro que troque de porta depois de dentro.",
        fix: "Decida a porta ANTES. Se o número já está na Cloud API, a Coexistência só volta a ser possível pelo plano B (excluir da WABA → registrar no app → reacoplar).",
        lived: true,
      },
    ],
    next: "empresa-portfolio",
  },
  {
    id: "empresa-portfolio",
    order: 2,
    title: "Portfólio empresarial e Verificação da empresa",
    goal: "Ter um portfólio (Business Manager) verificado, dono dos ativos de WhatsApp.",
    tags: ["portfolio", "irreversivel"],
    steps: [
      { who: "voce", text: "business.facebook.com → Configurações do negócio: criar ou escolher o portfólio da empresa." },
      { who: "voce", text: "Central de Segurança → Verificação da empresa: enviar os documentos (razão social, CNPJ, site, telefone comercial) e esperar a decisão (horas a dias)." },
      { who: "ambos", text: "Anote o ID do portfólio (business_id na URL). Ele é público, não é segredo." },
    ],
    checks: [{ text: "business_verification_status = verified na WABA.", tool: "wa_check_waba" }],
    pitfalls: [
      {
        symptom: "Campos de Razão social / Endereço / Telefone ficam bloqueados para edição.",
        cause: "A verificação está 'Em análise'.",
        fix: "Só esperar a Meta. Não há atalho.",
        lived: true,
      },
      {
        symptom: "'Conta do WhatsApp Business não verificada' ao registrar o número (POST /{phone_id}/register).",
        cause: "Verificação da empresa ainda pendente.",
        fix: "Esperar a aprovação e repetir o registro.",
        lived: true,
      },
      {
        symptom: "Central de Segurança mostra 'WhatsApp needs more information / Informações adicionais necessárias' e o botão abre uma conta que você não consegue acessar.",
        cause: "A verificação ficou apontando para uma WABA criada e perdida durante o processo (conta fantasma). Não é banimento nem restrição do portfólio.",
        fix: "Não apague o portfólio. Crie uma conta de WhatsApp real dentro dele (fase 'conta-e-numero'); com uma conta real o item passa a mostrar o que falta.",
        lived: true,
      },
      {
        symptom: "Existem vários portfólios e várias WABAs com nome igual ou parecido.",
        cause: "O processo de verificação/cadastro foi rodado mais de uma vez; a Meta cria contas a cada tentativa.",
        fix: "Sempre confira pelo ID, nunca pelo nome. Excluir portfólio é permanente e pode jogar fora a verificação do CNPJ — não faça para 'recomeçar limpo'.",
        lived: true,
      },
    ],
    next: "app-meta",
  },
  {
    id: "app-meta",
    order: 3,
    title: "App no Meta for Developers",
    goal: "Ter um app publicado, ligado ao portfólio, com o caso de uso de WhatsApp — e um app por sistema.",
    tags: ["app", "seguranca"],
    steps: [
      { who: "voce", text: "developers.facebook.com/apps → Criar app, caso de uso 'Conectar-se com clientes pelo WhatsApp', vinculado ao portfólio." },
      { who: "voce", text: "Configurações → Básico: preencher a URL da política de privacidade (sem ela o botão Publicar não libera)." },
      { who: "voce", text: "Publicar o app (modo 'Ao vivo')." },
      { who: "voce", text: "Anote o App ID. A 'Chave secreta' (App Secret) fica em Configurações → Básico → Mostrar (a Meta pede a sua senha) e só você a copia." },
      { who: "ambos", text: "Para os ativos do próprio negócio o Acesso Padrão basta; Acesso Avançado (Análise do app) só é necessário para operar portfólios de terceiros." },
    ],
    checks: [{ text: "App aparece como 'Ao vivo' e o App ID está anotado." }],
    pitfalls: [
      {
        symptom: "Mensagens de um sistema caem na caixa de outro.",
        cause: "O webhook do WhatsApp é configurado por APP. Dois sistemas no mesmo app disputam a mesma URL de callback.",
        fix: "Um app por sistema, cada um com o seu callback. Se precisar compartilhar o app, use override_callback_uri por WABA (fase 'webhook') e nunca troque o callback do app.",
        lived: true,
      },
      {
        symptom: "O 'Token do Cliente' (32 caracteres) não funciona como token de acesso — 'Cannot parse access token'.",
        cause: "É outro objeto, usado só por SDKs client-side.",
        fix: "Use o token de Usuário do Sistema (fase 'usuario-sistema-token').",
        lived: true,
      },
      {
        symptom: "Permissão business_management reprovada na Análise do app.",
        cause: "Ela só dá Acesso Avançado para portfólios de terceiros.",
        fix: "Para operar só o próprio número não bloqueia nada; as permissões de WhatsApp aprovadas bastam.",
        lived: true,
      },
      {
        symptom: "O MCP oficial da Meta (mcp.facebook.com/devtools) não traz Phone Number ID nem nada de WhatsApp.",
        cause: "Segundo a documentação dele, cobre app, análise, conformidade e webhooks — não números, WABAs, templates nem tokens.",
        fix: "Use as ferramentas wa_* deste MCP (Graph API direta) para o que é de WhatsApp.",
        lived: true,
      },
    ],
    next: "conta-e-numero",
  },
  {
    id: "conta-e-numero",
    order: 4,
    title: "Conta do WhatsApp (WABA) e número — inclusive o virtual",
    goal: "Ter uma WABA no portfólio e um número com status Conectado.",
    tags: ["waba", "numero-virtual", "cloud-api"],
    steps: [
      { who: "voce", text: "Configurações do negócio → Contas do WhatsApp → Adicionar. Há três opções: 'Criar conta do WhatsApp', 'Solicitar conta para um cliente' e 'Vincular conta existente'. Para o seu negócio: Criar." },
      { who: "voce", text: "O assistente 'Create your WhatsApp profile' tem 4 passos: Detalhes → Telefone → Verificação do telefone → Messaging accounts." },
      { who: "voce", text: "Detalhes: nome de exibição (escreva 'Minha Empresa', não 'MINHA EMPRESA') e categoria da empresa." },
      { who: "voce", text: "Telefone: um número seu (verificado por SMS/ligação na etapa seguinte) ou, quando a Meta oferece, um número virtual fornecido pelo próprio WhatsApp (foi o caso de números +1 711-…). A tela exata pode variar." },
      { who: "voce", text: "Terminado, o número aparece como 'Conectado' e o nome de exibição como 'Em análise'." },
      { who: "ambos", text: "Número próprio no caminho B: se o painel não registrar sozinho, registre com POST /{phone_number_id}/register {messaging_product:'whatsapp', pin:'<6 dígitos>'} — o PIN vira a verificação em duas etapas, guarde-o. NUNCA faça isso no caminho C (coexistência): lá o número já é registrado pelo app." },
      { who: "automatico", text: "Confira pela API: status, code_verification_status, platform_type e name_status." },
    ],
    checks: [
      { text: "status = CONNECTED e platform_type = CLOUD_API.", tool: "wa_list_phone_numbers" },
      { text: "name_status: APPROVED libera envio; PENDING_REVIEW → erro 131037 até a Meta aprovar.", tool: "wa_list_phone_numbers" },
    ],
    pitfalls: [
      {
        symptom: "No passo Telefone: 'Conta com restrição — sua conta do WhatsApp Business está restrita no momento'.",
        cause: "A conta de WhatsApp à qual o fluxo está ligado (não o número, não o portfólio) está restrita. No caso real era uma WABA fantasma da verificação.",
        fix: "Só a Meta tira a restrição. O chat de suporte classificou como 'Ativo desabilitado ou restrito' mas só a IA respondeu e se recusou a transferir. O que destravou depois não ficou identificado: horas depois uma WABA nova foi criada normalmente no mesmo portfólio. Tente de novo, em outro momento, antes de escalar.",
        lived: true,
      },
      {
        symptom: "Nome de exibição rejeitado ou 'Verificação adicional necessária'.",
        cause: "Nome todo em maiúsculas, nome que não bate com a empresa/site, ou nome genérico.",
        fix: "Use o nome comercial com capitalização normal e coerente com o site/CNPJ.",
        lived: true,
      },
      {
        symptom: "Envio falha com 131037 logo após criar o número.",
        cause: "O número fornecido pelo WhatsApp precisa da aprovação do nome de exibição antes de enviar.",
        fix: "Esperar. Só a Meta libera. Acompanhe name_status e reenvie o teste depois.",
        lived: true,
      },
      {
        symptom: "O celular não abre conversa com o número +1 711-… (hipótese, não confirmada).",
        cause: "711 não é código de área comum (é código de serviço); o app pode recusar o número como destino.",
        fix: "Teste https://wa.me/<numero> no celular. Se não abrir, a conversa precisa começar pela empresa (template aprovado); o cliente responde pelo chat que já existe.",
        lived: true,
      },
      {
        symptom: "code_verification_status = EXPIRED com status CONNECTED.",
        cause: "Só o último código de verificação caducou.",
        fix: "Nada. Não afeta envio nem recebimento de número já registrado.",
        lived: true,
      },
      {
        symptom: "Não consigo excluir o número da WABA.",
        cause: "Número que enviou mensagens pagas nos últimos 30 dias não pode ser excluído; só administrador exclui.",
        fix: "Aguardar os 30 dias ou manter o número onde está.",
        lived: false,
      },
      {
        symptom: "Templates sumiram depois de excluir/recriar a WABA.",
        cause: "Templates pertencem à WABA e não migram. Excluir a WABA (ACCOUNT_DELETED) apaga o que estava nela.",
        fix: "Recrie os templates na nova WABA (fase 'templates').",
        lived: true,
      },
    ],
    next: "ids",
  },
  {
    id: "ids",
    order: 5,
    title: "Os IDs certos (a maior fonte de confusão)",
    goal: "Saber qual ID é qual e ter WABA ID e Phone Number ID corretos no sistema.",
    tags: ["ids", "waba"],
    steps: [
      { who: "ambos", text: "WABA ID da API: está na URL de Configurações do negócio → Contas do WhatsApp (selected_asset_id). É o que a Graph API aceita em /{waba_id}/…" },
      { who: "ambos", text: "O seletor de contas do Gerenciador do WhatsApp mostra OUTRO número: o da 'conta de mensagens' (onde ficam os modelos). Não use esse como WABA ID." },
      { who: "ambos", text: "Phone Number ID: Gerenciador do WhatsApp → Números de telefone → engrenagem do número → 'Identificação do número de telefone'. Ou via API." },
      { who: "automatico", text: "Com um token válido, deixe o MCP descobrir tudo sozinho (wa_discover_ids): ele lê as contas a que o token tem acesso e lista os números de cada uma." },
    ],
    checks: [{ text: "Um GET /{waba_id} responde com o nome certo.", tool: "wa_check_waba" }],
    pitfalls: [
      {
        symptom: "Erro #100 'Object with ID … does not exist, cannot be loaded due to missing permissions, or does not support this operation'.",
        cause: "Quase sempre ID trocado (ID do Gerenciador no lugar do WABA ID) ou Usuário do Sistema sem acesso àquela conta.",
        fix: "Rode wa_discover_ids. Se a conta não aparece, atribua-a ao Usuário do Sistema (fase 'usuario-sistema-token').",
        lived: true,
      },
      {
        symptom: "A mesma conta responde por dois IDs (o 'WABA ID' e o da 'conta de mensagens'); o health_status do número cita um, o sistema usa outro.",
        cause: "Os dois são aliases da mesma conta: ambos listam o mesmo número em /phone_numbers. Mas subscribed_apps é por ID: assinar em um deixa o outro vazio, e a Meta roteia status e mensagens recebidas pelo ID que o health_status aponta.",
        fix: "Compare o ID da entidade WABA em GET /{phone_number_id}?fields=health_status com o seu META_WABA_ID (o wa_diagnose faz). Se diferirem, assine o app nos dois IDs.",
        lived: true,
      },
      {
        symptom: "Vejo várias contas com o mesmo nome e não sei qual é.",
        cause: "Várias WABAs homônimas (resíduo do processo de verificação).",
        fix: "Procure a que tem o número dentro, pelo ID. A API só enxerga as WABAs atribuídas ao usuário do token; para as demais só o navegador logado como administrador.",
        lived: true,
      },
    ],
    next: "usuario-sistema-token",
  },
  {
    id: "usuario-sistema-token",
    order: 6,
    title: "Usuário do Sistema e token permanente",
    goal: "Ter um token que não expira, com acesso mínimo, enxergando a WABA certa.",
    tags: ["token", "seguranca"],
    steps: [
      { who: "voce", text: "Configurações do negócio → Usuários → Usuários do sistema → Adicionar. Papel Employee (menor privilégio). Primeira vez no portfólio, a Meta pede para aceitar a política de não discriminação." },
      { who: "voce", text: "Atribuir ativos (mínimo): o APP com 'Desenvolver app' (sem 'Gerenciar app'); a CONTA DO WHATSAPP com 'Números de telefone (ver e gerenciar)' + 'Mensagens', com 'Tudo' desligado." },
      { who: "voce", text: "Em Contas do WhatsApp → a conta de mensagens → Atribuir pessoas: dê também 'Modelos de mensagem (ver e gerenciar)' ao usuário. Sem isso listar/criar templates dá erro #200." },
      { who: "voce", text: "Gerar token: escolha o app, validade 'Nunca expira', marque whatsapp_business_messaging e whatsapp_business_management. A Meta mostra o token UMA vez." },
      { who: "voce", text: "Cole o token só no seu sistema / na variável META_ACCESS_TOKEN do MCP. Quem digita segredos é você — o agente não." },
      { who: "automatico", text: "Valide com wa_check_token: type = SYSTEM_USER, expires_at = 0, escopos de WhatsApp presentes." },
    ],
    checks: [{ text: "debug_token: type SYSTEM_USER, expires_at 0, is_valid true.", tool: "wa_check_token" }],
    pitfalls: [
      {
        symptom: "'Session has expired' horas depois de configurar; canal vira ERROR.",
        cause: "Era um token de usuário comum (curta duração).",
        fix: "Gere token de Usuário do Sistema com 'Nunca expira'. Ponte provisória: trocar token curto por longo (60 dias) com GET /oauth/access_token?grant_type=fb_exchange_token&client_id=…&client_secret=…&fb_exchange_token=… .",
        lived: true,
      },
      {
        symptom: "Token válido, mas a WABA não aparece.",
        cause: "O Usuário do Sistema não foi atribuído àquela WABA (atribuir a uma WABA não vale para as outras).",
        fix: "Atribuir pessoas na WABA certa. Depois de salvar, a tela às vezes mostra 'Nenhum ativo atribuído' — recarregue antes de concluir que falhou.",
        lived: true,
      },
      {
        symptom: "(#10) 'You do not have WhatsApp granular permission for sending messages on behalf of this WhatsApp Business Account' ao enviar.",
        cause: "O escopo do token existe, mas o Usuário do Sistema não tem controle de mensagens sobre a WABA. Atribuir só 'Modelos de mensagem' basta para listar templates e NÃO basta para enviar. O token antigo pode não herdar a permissão nova.",
        fix: "Adicionar a WABA aos ativos do usuário com Controle total (ou Números + Mensagens), gerar um token novo e colar no sistema. Confira o granular_scopes com wa_check_token. Depois do ajuste o erro some no envio seguinte.",
        lived: true,
      },
      {
        symptom: "O usuário tem 'Acesso total' na conta, com pagamento e atribuição.",
        cause: "Atribuição mais ampla que o necessário.",
        fix: "Reduza para Números (ver e gerenciar) + Mensagens (+ Modelos).",
        lived: true,
      },
    ],
    next: "webhook",
  },
  {
    id: "webhook",
    order: 7,
    title: "Webhook: receber mensagens e status",
    goal: "A Meta consegue entregar eventos no seu sistema, com assinatura verificada.",
    tags: ["webhook", "seguranca"],
    steps: [
      { who: "voce", text: "Tenha uma URL pública HTTPS. Opções que funcionaram: VPS + Caddy + relay; ou Cloudflare Tunnel com hostname fixo expondo SÓ a rota do webhook (todo o resto responde 403)." },
      { who: "ambos", text: "No servidor: GET devolve hub.challenge se hub.verify_token bater; POST valida X-Hub-Signature-256 (HMAC-SHA256 do corpo cru com o App Secret) e rejeita o que não bater." },
      { who: "voce", text: "No app: WhatsApp → Configuração (ou Webhooks → objeto 'WhatsApp Business Account'): informar URL de callback + verify token e 'Verificar e salvar'; assinar o campo 'messages' (traz mensagens recebidas e status)." },
      { who: "automatico", text: "Inscrever o app na WABA: POST /{waba_id}/subscribed_apps (wa_subscribe_webhooks). Confira com wa_check_webhook; com META_APP_ID + META_APP_SECRET, wa_check_app_webhook mostra a URL de callback e os campos assinados." },
      { who: "ambos", text: "App compartilhado entre sistemas: em vez de trocar o callback do app, inscreva a WABA com override_callback_uri + verify_token próprios (o callback passa a valer só para aquela WABA)." },
      { who: "voce", text: "Teste: em 'Testar' do campo messages, 'Enviar para servidor'. Depois mande uma mensagem real." },
    ],
    checks: [
      { text: "subscribed_apps lista o seu app.", tool: "wa_check_webhook" },
      { text: "Callback e campo 'messages' assinados no app.", tool: "wa_check_app_webhook" },
      { text: "Uma mensagem real aparece nos eventos do servidor." },
    ],
    pitfalls: [
      {
        symptom: "Mensagem enviada ao número 'não chegou no sistema' e o log mostra 0 eventos.",
        cause: "O webhook do app estava sem URL de callback, sem verify token e sem campos assinados — a Meta não tinha para onde entregar.",
        fix: "Configurar callback, verify token e assinar 'messages'; inscrever a WABA. Mensagens antigas não são reentregues.",
        lived: true,
      },
      {
        symptom: "Teste 'Enviar para servidor' é recebido, validado e descartado.",
        cause: "O exemplo da Meta usa um phone number ID fictício (123456123); o sistema corretamente ignora o que não é do seu número.",
        fix: "Não é defeito. Prove com mensagem real.",
        lived: true,
      },
      {
        symptom: "(#2200) Callback verification failed … DNS resolution timed out.",
        cause: "A Meta não resolveu seu domínio naquele instante. Transitório.",
        fix: "Confirme que o handshake responde (curl com hub.challenge) e repita.",
        lived: true,
      },
      {
        symptom: "A API devolve ok mas a mensagem não entrega; o sistema só mostra 'Message undeliverable'.",
        cause: "O erro real vem no webhook de STATUS, em errors[].code + title + error_data.details — guardar só o 'message' genérico esconde a causa.",
        fix: "Grave code/title/details do evento e guarde o corpo cru de cada webhook recebido (ex.: uma tabela de eventos no relay) para depurar.",
        lived: true,
      },
      {
        symptom: "Callback verificado, campo 'messages' assinado, wa_check_webhook ok — e mesmo assim zero eventos (nem 'delivered' nem mensagens recebidas).",
        cause: "O app estava inscrito só em um dos dois IDs da mesma conta; a Meta entrega pelo outro, que ficou com subscribed_apps vazio.",
        fix: "Assine o app também no ID que o health_status do número aponta (wa_diagnose mostra a diferença) e teste com mensagem nova.",
        lived: true,
      },
      {
        symptom: "Todo evento é recusado por assinatura.",
        cause: "App Secret ausente ou de outro app.",
        fix: "Cole o App Secret do app CERTO no sistema (você, não o agente). Bom sistema confere a chave na Meta antes de salvar.",
        lived: true,
      },
      {
        symptom: "Sistema ficou fora do ar e mensagens se perderam.",
        cause: "A Meta reenvia por algumas horas e depois descarta.",
        fix: "Mantenha o receptor sempre ligado (serviço/túnel subindo com o sistema).",
        lived: false,
      },
    ],
    next: "faturamento",
  },
  {
    id: "faturamento",
    order: 8,
    title: "Moeda e forma de pagamento",
    goal: "A WABA tem país/moeda definidos e um cartão — senão só funciona a janela de 24h.",
    tags: ["faturamento", "irreversivel"],
    steps: [
      { who: "voce", text: "Billing hub da WABA (wizard CHANGE_COUNTRY_CURRENCY): país Brasil, moeda BRL, fuso São Paulo. É IRREVERSÍVEL — decida com calma." },
      { who: "voce", text: "Cadastre a forma de pagamento (wizard ADD_PM). Dados financeiros: só você digita." },
      { who: "ambos", text: "Entenda a cobrança: resposta dentro da janela de 24h aberta pelo cliente tende a ser gratuita; template iniciado pela empresa é cobrado e exige pagamento. Confirme os preços vigentes na Meta — as regras mudam (os docs do projeto citam mudança a partir de 01/10/2026; reconfirme)." },
    ],
    checks: [
      { text: "currency preenchida na WABA.", tool: "wa_check_waba" },
      { text: "Forma de pagamento: a API não mostra; confira no billing hub." },
    ],
    pitfalls: [
      {
        symptom: "Erro 131042 'Business eligibility payment issue' / 'currency is not configured'.",
        cause: "WABA nova nasce sem moeda/conta de faturamento.",
        fix: "Definir país/moeda no billing hub. O popup de erro genérico ao salvar pode aparecer mesmo com a moeda aplicada — confira o saldo/moeda no fim da página.",
        lived: true,
      },
      {
        symptom: "'No payment method is set up' só para quem não escreveu antes; para quem escreveu funciona.",
        cause: "Dentro da janela de 24h a mensagem é gratuita; fora dela é template cobrado.",
        fix: "Cadastrar cartão. Para depurar sem cartão, teste com quem acabou de escrever.",
        lived: true,
      },
      {
        symptom: "Saúde do número mostra 141006 (erro no método de pagamento).",
        cause: "Bloqueia conversas iniciadas pela empresa.",
        fix: "Cadastrar/corrigir a forma de pagamento.",
        lived: true,
      },
      {
        symptom: "Cadastrei o cartão e quero saber se liberou.",
        cause: "A API não expõe a forma de pagamento, e GET /{waba_id}?fields=primary_funding_id responde #10 'exige Business Solution Provider'.",
        fix: "Leia GET /{phone_number_id}?fields=health_status: a entidade WABA passa de BLOCKED (141006) para AVAILABLE. Só então dispare — o que foi aceito durante o bloqueio não é reenviado.",
        lived: true,
      },
    ],
    next: "templates",
  },
  {
    id: "templates",
    order: 9,
    title: "Templates de mensagem",
    goal: "Ter pelo menos um template APPROVED para iniciar conversas fora da janela de 24h.",
    tags: ["templates"],
    steps: [
      { who: "ambos", text: "Criar no Gerenciador do WhatsApp ou pela API (POST /{waba_id}/message_templates). Categoria Marketing ou Utilidade; idioma pt_BR." },
      { who: "ambos", text: "Cabeçalho de imagem: envio pela API de upload resumível da Meta (cada criação com imagem leva ~10 s; em lote, rode em segundo plano)." },
      { who: "automatico", text: "Acompanhe com wa_list_templates (status IN_REVIEW → APPROVED/REJECTED). Aprovação leva de minutos a dias." },
      { who: "ambos", text: "hello_world já vem pronto em contas novas (en_US) e serve para o primeiro teste." },
    ],
    checks: [{ text: "Ao menos um template com status APPROVED.", tool: "wa_list_templates" }],
    pitfalls: [
      {
        symptom: "Template criado como Utilidade volta como Marketing.",
        cause: "A Meta reclassifica por conteúdo. Marketing é mais caro.",
        fix: "Reescreva em tom transacional se for o caso; aceite a reclassificação se for promoção.",
        lived: true,
      },
      {
        symptom: "'Os modelos de mensagem só podem ser editados se tiverem sido rejeitados.'",
        cause: "Regra da Meta: só REJECTED edita.",
        fix: "Para mudar um aprovado ou em análise, apague e recrie. Apagar funciona em qualquer status.",
        lived: true,
      },
      {
        symptom: "Os templates aprovados no Gerenciador não aparecem no sistema.",
        cause: "Estavam em outra WABA de mesmo nome. Templates não se movem entre WABAs.",
        fix: "Recriar na WABA certa e apagar da errada. Confira sempre pelo ID.",
        lived: true,
      },
      {
        symptom: "Erro #200 ao listar/sincronizar templates.",
        cause: "O Usuário do Sistema não tem 'Modelos de mensagem' na conta de mensagens.",
        fix: "Contas de mensagens → Atribuir pessoas → Modelos de mensagem (ver e gerenciar).",
        lived: true,
      },
      {
        symptom: "Template com imagem no cabeçalho falha no disparo com #132012.",
        cause: "O header_handle da criação só vale para a aprovação; cada envio precisa mandar a mídia de novo no componente header.",
        fix: "Inclua o header com a imagem (link ou id de mídia) em todo envio.",
        lived: true,
      },
    ],
    next: "primeiro-envio",
  },
  {
    id: "primeiro-envio",
    order: 10,
    title: "Primeiro envio e verificação final",
    goal: "Provar a cadeia inteira: enviar, entregar, receber.",
    tags: ["envio"],
    steps: [
      { who: "automatico", text: "Rode wa_diagnose: ele junta token, WABA, número, webhook e templates num relatório com a próxima fase a corrigir." },
      { who: "ambos", text: "Envie um template aprovado para um contato SEU, sempre o mesmo em todos os testes. Use wa_send_template_test (pede confirmação explícita)." },
      { who: "ambos", text: "Confirme: wamid devolvido pela API, depois status delivered/read no webhook, depois responda pelo celular e veja a resposta entrar no sistema." },
      { who: "ambos", text: "Disparos em massa: na API oficial o limite real é o tier (contatos novos únicos por 24h), não a velocidade. Um intervalo curto (~5 s) basta; o intervalo 'humano' longo só faz sentido em WhatsApp não oficial." },
    ],
    checks: [
      { text: "wa_diagnose sem nenhum FAIL.", tool: "wa_diagnose" },
      { text: "Mensagem entregue no celular e resposta recebida no sistema." },
    ],
    pitfalls: [
      {
        symptom: "Duas conversas para a mesma pessoa (55DD9XXXXXXXX e 55DDXXXXXXXX).",
        cause: "Número brasileiro com e sem o nono dígito: o WhatsApp identifica de um jeito no webhook e você digitou de outro.",
        fix: "Gere as duas variantes do número e procure conversa/contato por qualquer uma delas.",
        lived: true,
      },
      {
        symptom: "Campanha toda 'enviada' (wamid devolvido), mas nada chega ao celular e nenhum status volta.",
        cause: "Dois suspeitos que se somam: (1) WABA bloqueada por pagamento (141006) — a API aceita e a recusa só vem no status; (2) webhook sem assinatura no ID certo da conta, então nem a recusa chega ao sistema.",
        fix: "Rode wa_diagnose: ele lê o health_status do número e compara os IDs da WABA. Resolva o pagamento e a assinatura, e dispare uma campanha nova.",
        lived: true,
      },
      {
        symptom: "Primeiro teste 'ok' na API e nada no celular.",
        cause: "Ver o erro real no webhook de status: 131037 (nome de exibição em análise), 131042 (pagamento), 131047 (fora da janela, precisa de template), 131030 (número de teste: destinatário fora da lista).",
        fix: "wa_explain_error com o código.",
        lived: true,
      },
    ],
  },
  {
    id: "coexistencia",
    order: 11,
    title: "Coexistência — tudo o que confirmamos (apêndice)",
    goal: "Evitar semanas perdidas: o que a Coexistência realmente exige, como implementar o fim do fluxo e como ela falha.",
    tags: ["coexistencia", "irreversivel"],
    steps: [
      { who: "voce", text: "Pré-condições da documentação: ser Provedor de Tecnologia ou Solution Partner; Análise do app concluída; Cadastro Incorporado com session logging; webhook funcionando; app WhatsApp Business 2.24.17+; número registrado SÓ no app WhatsApp Business (fora de qualquer WABA/Cloud API)." },
      { who: "voce", text: "Painel do app → Login do Facebook para Empresas → Configurações → Criar do modelo 'Configuração do cadastro incorporado do WhatsApp com token de expiração em 60 dias' (gera o config_id). Em Configurações gerais: 'Entrar com o SDK do JavaScript' = Sim e o seu domínio HTTPS em 'Domínios permitidos'." },
      { who: "ambos", text: "Assinar no app, além de 'messages': smb_message_echoes (o que a equipe digita no celular), history (histórico) e smb_app_state_sync (contatos). Via POST /{app_id}/subscriptions com token de app; preserve os campos que já existem." },
      { who: "ambos", text: "FB.login com os extras que o Configurador de cadastro incorporado gera (fonte da verdade, não a doc): featureType 'whatsapp_business_app_onboarding', sessionInfoVersion '3', version 'v4'. A versão 2 do Cadastro Incorporado foi descontinuada em 15/10/2026." },
      { who: "voce", text: "No popup: informar o número, receber o código, TOCAR em 'Conectar à Plataforma de Negócios' no app do celular e colar o código. Não é QR Code. Não cadastre o número de novo nem crie PIN." },
      { who: "automatico", text: "Fim do fluxo no servidor: trocar o code pelo token (expira em 60 dias, a menos que você use um token permanente de Usuário do Sistema que enxergue o número); descobrir WABA e número pelo próprio token (debug_token → granular_scopes → /phone_numbers), casando o telefone com e sem nono dígito; gravar os IDs; inscrever a WABA; conectar." },
      { who: "automatico", text: "Sincronização: POST /{phone_number_id}/smb_app_data com sync_type 'smb_app_state_sync' (contatos) e depois 'history'. CADA UM SÓ UMA VEZ e dentro de 24 h do fim do cadastro — refazer exige offboarding e o fluxo inteiro de novo. Guarde o request_id de cada um." },
      { who: "ambos", text: "history: até 180 dias em 3 fases, em partes fora de ordem (ordenar por chunk_order; progress 100 = fim), um webhook pode ter milhares de mensagens (capture e processe assíncrono), mídia vem como media_placeholder (id só para mídias dos últimos 14 dias), grupos não entram, recusa de compartilhar chega como erro 2593109." },
      { who: "automatico", text: "Prova oficial: GET /{phone_number_id}?fields=is_on_biz_app,platform_type → is_on_biz_app=true + CLOUD_API (wa_check_coexistence). Prova prática: mensagem digitada no app aparece no sistema (eco smb_message_echoes)." },
      { who: "voce", text: "Depois de ativa: abra o app no celular ao menos a cada ~2 semanas (sem uso a Meta desconecta). Para sair: no app, Configurações → Conta → Plataforma comercial → Desconectar conta (gera account_update PARTNER_REMOVED); não use a API de descadastro." },
    ],
    checks: [
      { text: "is_on_biz_app = true e platform_type = CLOUD_API.", tool: "wa_check_coexistence" },
      { text: "Mensagem digitada no app do celular aparece no sistema." },
      { text: "Os dois smb_app_data aceitos, com request_id guardado." },
    ],
    pitfalls: [
      {
        symptom: "Erro #3441034 'Este número não se qualifica para registro ou migração'.",
        cause: "É o fluxo PADRÃO reclamando que o número já existe. Não prova inelegibilidade.",
        fix: "Use a porta certa (número só no app) ou aceite o caminho A.",
        lived: true,
      },
      {
        symptom: "Mesmo com tudo cumprido, a tela é sempre a padrão ('Adicione seu número / Você não tem nenhum número existente').",
        cause: "Em ago–out/2026 a Meta nunca ofereceu a variação ao app, com parâmetros idênticos aos do configurador (confirmado interceptando o window.open). A IA do suporte disse que a habilitação seria um 'processo manual' da Meta, que nunca foi executado.",
        fix: "Não insista em parâmetros: já foram todos eliminados. Opções: suporte (fase 'suporte-meta'), BSP que já ofereça coexistência, ou o caminho A (número novo só para disparos). Pare ANTES de digitar o número no fluxo padrão — ele seria registrado só na Cloud API e sairia do app.",
        lived: true,
      },
      {
        symptom: "A página hospedada da Meta (business.facebook.com/messaging/whatsapp/onboard/?app_id=…&config_id=…&extras=…) abre o fluxo antigo.",
        cause: "Ela reescreve os extras: você manda version 'v4' e o diálogo abre com 'v3' + is_hosted_es, e a v3 ignora a coexistência.",
        fix: "Prefira o JS SDK (FB.login) num domínio HTTPS permitido.",
        lived: true,
      },
      {
        symptom: "O popup do SDK não abre ou recusa em http://localhost.",
        cause: "O JS SDK só funciona em domínio HTTPS listado em 'Domínios permitidos para o SDK do JavaScript'.",
        fix: "Rode o fluxo no domínio público do sistema; em uso só local, a página hospedada é a alternativa (com a ressalva da v3).",
        lived: true,
      },
      {
        symptom: "O app compartilhado manda os eventos de um número para o sistema errado.",
        cause: "Com o callback do app apontando para outro sistema, assinar webhooks na WABA nova desvia mensagens.",
        fix: "Relay próprio + override_callback_uri na inscrição da WABA; filtre eventos pelo Phone Number ID.",
        lived: true,
      },
      {
        symptom: "Depois de ativar: listas de transmissão viraram só leitura, aparelhos foram desconectados, grupos não aparecem no sistema.",
        cause: "Efeitos documentados da coexistência: listas de transmissão desativadas; mensagens temporárias, visualização única e localização ao vivo desativadas; aparelhos vinculados desconectados (WhatsApp para Windows e WearOS incompatíveis); grupos, ligações, catálogo e rótulos não passam pela API; vazão fixa de 20 mps.",
        fix: "Decida antes. Ganho: editar/apagar mensagem passa a ser possível, e mensagens enviadas pelo app não abrem nem cobram janela da Cloud API.",
        lived: false,
      },
      {
        symptom: "Erro 131060 na primeira mensagem de um usuário.",
        cause: "Esperado com dispositivos adicionais incompatíveis.",
        fix: "Não é falha.",
        lived: false,
      },
    ],
    next: "suporte-meta",
  },
  {
    id: "suporte-meta",
    order: 12,
    title: "Suporte da Meta — o que funciona e o que é parede de IA (apêndice)",
    goal: "Saber onde pedir ajuda e o que esperar, para não esperar por promessas da IA.",
    tags: ["suporte"],
    steps: [
      { who: "voce", text: "Chat ao vivo: Gerenciador do WhatsApp → Ajuda → 'Falar com o suporte' → descrever → escolher o ATIVO certo (o portfólio afetado) → 'Conversa'. Foi o único canal em que um agente engajou de verdade." },
      { who: "voce", text: "Suporte Direto (casos): App Dashboard → Casos de uso → Conectar no WhatsApp → Recursos → 'Entrar em contato com o suporte'. Só aparece para Provedores de Tecnologia; para dev comum o resto é fórum público." },
      { who: "voce", text: "A doc indica para coexistência os tópicos 'WABiz: integração' / 'TechProvider: integração' → tipo 'Cadastro incorporado – Integração de coexistência'. No formulário real esses tópicos não apareciam (só 'Dev: …')." },
      { who: "ambos", text: "Escreva o pedido com IDs públicos (portfólio, WABA, App ID, Phone Number ID), o erro exato e o que já foi descartado. Nunca mande token nem App Secret." },
      { who: "voce", text: "Alternativas: Developer Community Forum (público — sem IDs) e Meta Verified (suporte humano pago)." },
    ],
    checks: [{ text: "Caso aberto com número anotado, ou decisão consciente de seguir outro caminho." }],
    pitfalls: [
      {
        symptom: "Caso fechado no mesmo minuto por 'Meta AI Agent'.",
        cause: "Severidade STANDARD → resposta automática e fechamento. 4 de 4 casos foram assim.",
        fix: "Não abra o quinto caso sem informação nova; use o chat ao vivo.",
        lived: true,
      },
      {
        symptom: "A IA diz que 'vai executar o processo manual' ou aponta Termos de Serviço pendentes.",
        cause: "Confabulação: devolveu os próprios IDs enviados como resposta; os termos 'pendentes' não existiam.",
        fix: "Não aguarde. Só conte com o que você consegue verificar na API/painel.",
        lived: true,
      },
      {
        symptom: "O agente manda para whatsapp.com/contact.",
        cause: "É o contato do CONSUMIDOR, sem caminho técnico para Cloud API.",
        fix: "Beco sem saída; volte ao chat do Gerenciador ou ao fórum.",
        lived: true,
      },
    ],
  },
];

export function getPhase(id: string): Phase | undefined {
  return PHASES.find(p => p.id === id);
}
