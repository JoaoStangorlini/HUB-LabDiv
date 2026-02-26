# 🛰️ MANUAL DE OPERAÇÃO: AGENTE ANTIGRAVITY (Hub-LabDiv Edition)

## 1. O Que é o Antigravity?
O Antigravity é um orquestrador de IA avançado que atua diretamente no código fonte. Ele não apenas sugere, ele executa edições, roda comandos de terminal e verifica o browser.

## 2. Modos de Operação
* **FAST Mode:** Para tarefas rápidas e atômicas (ex: "Corrija esse bug de CSS", "Crie um componente de botão").
* **PLANNING Mode:** Para arquitetura e refatoração complexa. O agente lê o contexto, cria um plano passo-a-passo e aguarda aprovação. **(Obrigatório para features do Hub Lab-Div).**

## 3. Sintaxe de Contexto (Context Awareness)
Para evitar alucinações, use estas referências no prompt:
* `@file`: Foca em um arquivo específico (ex: `@src/app/page.tsx`).
* `@folder`: Lê toda a estrutura de uma pasta (ex: `@src/components/ui`).
* `@codebase`: Pesquisa semântica em todo o projeto.
* `/fix`: Comando rápido para corrigir erros do terminal.

## 4. Fluxo de Trabalho Recomendado (The Divo Workflow)
1. **Discovery:** Use `@codebase` para entender onde a feature se encaixa.
2. **Planning:** Peça um "Plano de Implementação" detalhando quais arquivos serão criados/editados.
3. **Review:** O Gem "Arquiteto" DEVE aprovar este plano antes da execução.
4. **Execution:** Dê o comando de execução.
5. **Verification:** Peça para o agente rodar `npm run build` para garantir que nada quebrou.

## 5. Como Lidar com Erros
Se o Antigravity falhar ou travar:
1. Peça para ele rodar `git status` para ver o que foi alterado.
2. Se o código estiver quebrado, use o comando `git restore .` para voltar ao estado limpo.
3. Copie o erro do terminal e peça uma nova abordagem para o Gem Arquiteto.