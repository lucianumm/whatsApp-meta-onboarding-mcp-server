<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Tags

## `#cloud-api` — API oficial hospedada pela Meta (registro padrão)
- Fases: `escolher-caminho`, `conta-e-numero`
- Erros: Registro do número bloqueado: empresa não verificada, #133010

## `#numero-virtual` — Número fornecido pelo próprio WhatsApp / criado direto na Meta
- Fases: `escolher-caminho`, `conta-e-numero`
- Erros: #131037

## `#coexistencia` — Mesmo número no app WhatsApp Business e na Cloud API
- Fases: `escolher-caminho`, `coexistencia`
- Erros: #3441034, Popup mostra o cadastro padrão em vez da Coexistência, #131060, #2593109

## `#portfolio` — Portfólio empresarial e Verificação da empresa
- Fases: `empresa-portfolio`
- Erros: Registro do número bloqueado: empresa não verificada, 'WhatsApp needs more information' na Central de Segurança

## `#app` — App no Meta for Developers
- Fases: `app-meta`
- Erros: —

## `#waba` — Conta do WhatsApp Business e número
- Fases: `conta-e-numero`, `ids`
- Erros: Conta do WhatsApp Business com restrição, Login sem acesso à conta no Gerenciador do WhatsApp, code_verification_status = EXPIRED, #131031, #133010

## `#ids` — WABA ID, Phone Number ID, IDs que confundem
- Fases: `ids`
- Erros: #100, #10, Nenhum aviso de status/mensagem chega, mas a WABA 'está assinada', Login sem acesso à conta no Gerenciador do WhatsApp

## `#token` — Usuário do Sistema, token e permissões
- Fases: `usuario-sistema-token`
- Erros: #200, #100, #190, #10

## `#webhook` — Recebimento de mensagens e status
- Fases: `webhook`
- Erros: #2200, Nenhum aviso de status/mensagem chega, mas a WABA 'está assinada'

## `#faturamento` — Moeda, forma de pagamento e cobrança
- Fases: `faturamento`
- Erros: #131042, #141006, #10

## `#templates` — Modelos de mensagem
- Fases: `templates`
- Erros: #200, #132012, Template não pode ser editado, #131047, #132000, #132001

## `#envio` — Envio, entrega e erros de entrega
- Fases: `primeiro-envio`
- Erros: #131037, #131042, #132012, #10, #131047, #131030, #131026, #131056, #130429, #132000, #132001

## `#suporte` — Como (e onde) pedir ajuda à Meta
- Fases: `suporte-meta`
- Erros: Conta do WhatsApp Business com restrição, #131031

## `#seguranca` — Segredos, permissões mínimas, ações irreversíveis
- Fases: `app-meta`, `usuario-sistema-token`, `webhook`
- Erros: —

## `#irreversivel` — Ação que não dá para desfazer
- Fases: `empresa-portfolio`, `faturamento`, `coexistencia`
- Erros: —

