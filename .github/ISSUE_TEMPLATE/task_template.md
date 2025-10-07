---
name: 'Criação de Tarefa'
about: 'Use este modelo para tarefas técnicas, refatoração, documentação ou outras atividades.'
title: "[TASK] - "
labels: 'task'
assignees: ''

---

## 🎯 Objetivo / Motivação

Descreva o objetivo principal desta tarefa. Por que ela é necessária? Qual problema ela resolve ou qual melhoria ela traz?

*Exemplo: "Atualizar a biblioteca de logging para a versão mais recente (v3.x) para corrigir vulnerabilidades de segurança conhecidas e melhorar a performance."*

---

## 📋 Escopo da Tarefa e Entregáveis

Liste de forma clara e detalhada as atividades que precisam ser executadas. O que deve ser entregue ao final desta tarefa?

- [ ] Atualizar a versão da dependência no arquivo `requirements.txt`.
- [ ] Refatorar as chamadas `logger.warn()` para `logger.warning()` conforme a nova documentação.
- [ ] Verificar e ajustar os arquivos de configuração de logging.
- [ ] Garantir que os logs continuem sendo gerados no formato esperado em ambiente de desenvolvimento.

---

## ✅ Critérios de Aceitação

Como saberemos que a tarefa foi concluída com sucesso? Liste os pontos que devem ser validados.

- [ ] A aplicação inicia sem erros após a atualização da dependência.
- [ ] Todos os testes (unitários, integração, etc.) passam com sucesso.
- [ ] O comando `pip check` não reporta conflitos de dependência.
- [ ] A documentação interna sobre o setup do projeto (`README.md` ou similar) foi atualizada, se necessário.

---

## 🔗 Dependências (Opcional)

Esta tarefa depende de alguma outra? Ou alguma outra tarefa depende desta?

*Exemplo: "Esta tarefa bloqueia a Issue #123." ou "Depende da conclusão da Issue #456."*

---

## 💡 Sugestão de Implementação (Opcional)

Se você tiver uma ideia de como abordar a parte técnica, pode descrevê-la aqui. Links para documentação, artigos ou trechos de código são bem-vindos.

*Exemplo: "Seguir o guia de migração oficial da biblioteca: [link para a documentação]. É importante prestar atenção na seção sobre 'breaking changes'."*

---

<details>
<summary>Checklist do Autor</summary>

- [ ] Verifiquei se não há uma tarefa duplicada já aberta.
- [ ] O título da tarefa é claro e conciso.
- [ ] Descrevi o objetivo e a motivação por trás da tarefa.
- [ ] Os entregáveis e os critérios de aceitação estão bem definidos.
- [ ] Associei a tarefa a um projeto (Project) ou marco (Milestone), se aplicável.
</details>