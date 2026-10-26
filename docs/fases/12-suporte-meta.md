<!-- Gerado por scripts/generate-docs.ts — edite src/knowledge/ e rode `npm run docs`. -->

# Fase 12 — Suporte da Meta — o que funciona e o que é parede de IA (apêndice)

`#suporte`

**Objetivo:** Saber onde pedir ajuda e o que esperar, para não esperar por promessas da IA.

## Passos
1. **[VOCÊ]** Chat ao vivo: Gerenciador do WhatsApp → Ajuda → 'Falar com o suporte' → descrever → escolher o ATIVO certo (o portfólio afetado) → 'Conversa'. Foi o único canal em que um agente engajou de verdade.
2. **[VOCÊ]** Suporte Direto (casos): App Dashboard → Casos de uso → Conectar no WhatsApp → Recursos → 'Entrar em contato com o suporte'. Só aparece para Provedores de Tecnologia; para dev comum o resto é fórum público.
3. **[VOCÊ]** A doc indica para coexistência os tópicos 'WABiz: integração' / 'TechProvider: integração' → tipo 'Cadastro incorporado – Integração de coexistência'. No formulário real esses tópicos não apareciam (só 'Dev: …').
4. **[JUNTOS]** Escreva o pedido com IDs públicos (portfólio, WABA, App ID, Phone Number ID), o erro exato e o que já foi descartado. Nunca mande token nem App Secret.
5. **[VOCÊ]** Alternativas: Developer Community Forum (público — sem IDs) e Meta Verified (suporte humano pago).

## Como saber que terminou
- [ ] Caso aberto com número anotado, ou decisão consciente de seguir outro caminho.

## Armadilhas
- `vivido` **Caso fechado no mesmo minuto por 'Meta AI Agent'.**
  - Causa: Severidade STANDARD → resposta automática e fechamento. 4 de 4 casos foram assim.
  - O que fazer: Não abra o quinto caso sem informação nova; use o chat ao vivo.
- `vivido` **A IA diz que 'vai executar o processo manual' ou aponta Termos de Serviço pendentes.**
  - Causa: Confabulação: devolveu os próprios IDs enviados como resposta; os termos 'pendentes' não existiam.
  - O que fazer: Não aguarde. Só conte com o que você consegue verificar na API/painel.
- `vivido` **O agente manda para whatsapp.com/contact.**
  - Causa: É o contato do CONSUMIDOR, sem caminho técnico para Cloud API.
  - O que fazer: Beco sem saída; volte ao chat do Gerenciador ou ao fórum.
