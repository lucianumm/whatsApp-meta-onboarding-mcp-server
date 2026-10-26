<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 1 — Escolher o caminho

`#cloud-api` `#numero-virtual` `#coexistencia`

**Objetivo:** Decidir como o número vai entrar na API oficial antes de gastar tempo em qualquer tela.

## Passos
1. **[VOCÊ]** Caminho A — número NOVO criado direto na conta do WhatsApp (inclui o número virtual fornecido pelo próprio WhatsApp). O número vive só na Cloud API, sem app no celular. É o caminho de quem quer DISPARAR. Foi o que funcionou.
2. **[VOCÊ]** Caminho B — número que já existe, registro padrão na Cloud API. Exige o número livre de qualquer WhatsApp/WhatsApp Business; ele sai do app do celular.
3. **[VOCÊ]** Caminho C — Coexistência (app do celular + API no mesmo número). Exige número ativo SÓ no app WhatsApp Business (2.24.17+), popup do Cadastro Incorporado e um toque no celular. Na prática a Meta não ofereceu a variação (ver fase 'coexistencia').
4. **[VOCÊ]** Caminho D — número de teste da Meta (+1 555…). Só para desenvolver: destinatários precisam estar cadastrados e o número não serve de produção.
5. **[JUNTOS]** Regra de bolso: quer disparar campanhas e não precisa do app no celular → A. Precisa responder pelo celular e pela API no mesmo número → C (e aceite que pode não ser oferecido; perde listas de transmissão e fica em 20 mps). Número antigo que pode sair do celular → B.

## Como saber que terminou
- [ ] Você sabe qual caminho vai seguir e que ele é compatível com o estado atual do número.

## Armadilhas
- `vivido` **Tela padrão 'Adicione seu número' em vez da tela de Coexistência.**
  - Causa: As duas portas têm pré-condições opostas: registro padrão exige número livre; Coexistência exige número ativo no app. Não há parâmetro que troque de porta depois de dentro.
  - O que fazer: Decida a porta ANTES. Se o número já está na Cloud API, a Coexistência só volta a ser possível pelo plano B (excluir da WABA → registrar no app → reacoplar).

➡️ Próxima fase: [`empresa-portfolio`](02-empresa-portfolio.md)
