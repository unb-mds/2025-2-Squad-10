 1. Resumo Rápido
Scrum é um framework ágil focado em entregar valor de forma incremental e frequente, ideal para projetos com incerteza (requisitos que mudam, descoberta contínua). O trabalho é organizado em ciclos curtos chamados Sprints, com papéis, eventos e artefatos bem definidos para promover transparência, inspeção e adaptação.

 2. O que é Scrum

Objetivo: Permitir que times pequenos e auto-organizados entreguem incrementos de produto que gerem valor regularmente.
Quando usar: Projetos complexos, produtos em evolução ou quando o feedback constante do usuário é essencial.

 3. Pilares

Transparência: Tudo relevante sobre o trabalho deve ser visível (backlog, progresso, impedimentos)
Inspeção: Eventos regulares permitem checar se o trabalho e o caminho estão corretos
Adaptação: A equipe ajusta produto e processo quando encontra desvios ou novas informações
Esses pilares sustentam a cadeia de decisões curtas e ciclos iterativos.

 4. Papéis e Responsabilidades

Papel	Foco	Principais Responsabilidades
Product Owner (PO)	Negócio/Valor	Dono da visão do produto, prioriza o backlog, decide trade-offs de negócio
Scrum Master (SM)	Processo	Facilita o processo, remove impedimentos, protege o time de interferências externas
Time de Desenvolvimento	Execução	Multidisciplinar, auto-organizado, decide como entregar os itens do backlog

5. Eventos (Time-boxed)

Evento	Propósito	Duração
Sprint	Período fixo com objetivo claro (Sprint Goal)	1-4 semanas
Sprint Planning	Define o que será alcançado e como será feito	4h (para sprint de 2 semanas)
Daily Scrum	Sincronização rápida para inspecionar progresso	15 min diários
Sprint Review	Demonstração do incremento para stakeholders	1-2h (para sprint de 2 semanas)
Sprint Retrospective	Reflexão sobre o processo e planejamento de melhorias	1-2h (para sprint de 2 semanas)
Esses eventos criam ritmo, visibilidade e mecanismos formais de inspeção/adaptação.

 6. Artefatos Principais

Product Backlog: Lista priorizada de necessidades (sempre evoluindo)
Sprint Backlog: Itens selecionados para o Sprint + plano técnico/tarefas
Incremento: Conjunto de itens prontos que formam um potencial produto utilizável
Artefatos devem ter transparência (quem lê sabe estado e prioridade).

 7. Exemplos Práticos (Fluxo de 2 Semanas)

Antes do Sprint: PO prioriza backlog; SM garante definição de pronto básica
Sprint Planning (4h para 2 semanas): Escolher 6-10 itens, escrever Sprint Goal
Execução (dias 1-10): Daily às 10h (15 min); pareamentos, revisões de PR, testes
Dia 10 - Review: Demo para stakeholders; atualizar backlog com feedback
Dia 11 - Retro: Identificar 1-2 ações para o próximo Sprint (ex.: reduzir WIP, automatizar deploy)

8. DoR e DoD 

Definition of Ready (DoR) - Antes de entrar no Sprint:
História com descrição clara
Critérios de aceitação definidos
Estimativa concluída
Dependências mapeadas
Dados de teste/designs anexados
Definition of Done (DoD) - Para marcar item como concluído:
Código revisado
Testado (unitário+integração)
Documentação atualizada
Implementável
DoR/DoD curtos e visíveis evitam mal-entendidos e retrabalho.

📊 9. Métricas Úteis 

Velocidade (story points por Sprint): Para planejamento relativo
Lead/Cycle Time: Quanto tempo um item leva do início até a entrega
Throughput: Quantos itens completos por Sprint
Qualidade: Taxa de bugs/defeitos em produção
Use métricas como insumo para melhoria - não como punição.
 
 10. Anti-padrões Comuns (O que Evitar)
Time multitarefa demais (alto WIP) → diminui foco
PO ausente ou trocando prioridades o tempo todo → cria instabilidade
SM que vira gerente de tarefas (micromanagement)
Falta de preparação do backlog → Sprint Planning vira "adivinhação"
Identificar e corrigir esses anti-padrões é trabalho contínuo do SM + equipe.

 11. Recomendações Práticas para Começar

Comece com Sprints de 2 semanas (bom equilíbrio entre ritmo e previsibilidade)
Defina DoR/DoD simples e publique no repo/Confluence
Faça Daily sempre no mesmo horário e com formato ágil (foco no progresso e impedimentos)
Priorize demonstrar resultado funcional no Review — protótipo > slides
Na Retro, escolha 1 ação prática para o próximo Sprint (pequena e mensurável)

12. Checklist Rápido para o Time (Colar em Issue)

Existe um Sprint Goal claro?
Itens do Sprint têm DoR atendida?
DoD aplicado ao final de cada história?
Há um responsável por remover impedimentos?
Feedback da Review foi registrado no backlog?



Referencias:
https://youtu.be/XfvQWnRgxG0?si=dPv34SQETIpaeeTH
