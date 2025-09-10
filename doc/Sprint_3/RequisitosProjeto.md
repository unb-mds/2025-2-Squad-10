# Documento de Requisitos de Software: Radar de Investimento de Saúde Oncológica
# Versão: 1.0 (Escopo do MVP)
# Data: 09 de Setembro de 2025

1. **Visão Geral do Projeto**
O projeto **Radar de Investimento de Saúde Oncológica** visa analisar e dar transparência aos investimentos públicos em saúde oncológica nos municípios brasileiros. A solução irá extrair, padronizar e organizar dados da plataforma **Querido Diário**, que agrega uma vasta quantidade de diários oficiais municipais em formatos não padronizados.

O problema central a ser resolvido é a dificuldade em rastrear e analisar os gastos com licitações e contratações ligadas à oncologia (medicamentos, equipamentos, serviços e obras), devido à heterogeneidade e falta de padronização das fontes de dados.

2. **Requisitos Funcionais (RF)**
Os requisitos funcionais descrevem o que o sistema deve fazer. Eles estão organizados em Épicos e Histórias de Usuário para fornecer contexto, seguidos pelos requisitos formais detalhados.

**ÉPICO 1: **Busca e Análise de Dados**
Conjunto de funcionalidades que permitem ao usuário encontrar, extrair e classificar as informações relevantes dentro do grande volume de dados dos diários oficiais.

**História de Usuário 1.1: **Busca e Filtragem de Informações**

Como um usuário (pesquisador, cidadão)

* Eu quero poder buscar por palavras-chave e aplicar filtros (município, período), para que eu possa encontrar licitações e contratos específicos sobre saúde oncológica de forma rápida e precisa.

* RF01: Busca por Palavras-Chave: O sistema deve permitir a busca por palavras-chave relacionadas à saúde oncológica (ex: "oncologia", "câncer", "quimioterapia", "radioterapia").

* RF02: Filtragem de Resultados: O sistema deve permitir que os resultados da busca sejam filtrados por:

* Município e/ou Estado.

* Período de tempo (data de início e fim).

**Critérios de Aceite:**

* A busca deve funcionar combinando palavras-chave e filtros.

* A interface de filtros deve ser clara e de fácil utilização.

**História de Usuário 1.2: Extração e Classificação de Dados Financeiros**

Como um analista

* Eu quero que o sistema extraia e classifique automaticamente os valores monetários e o tipo de investimento, para que eu possa entender como os recursos estão sendo distribuídos sem análise manual.

* RF03: Extração de Valores Monetários: O sistema deve ser capaz de identificar e extrair valores monetários (em Reais, R$) de licitações e contratos encontrados nos diários.

* RF04: Classificação de Investimentos: O sistema deve processar os dados extraídos para classificá-los automaticamente por tipo de investimento, conforme as categorias definidas: Medicamentos, Equipamentos, Obras, Serviços de Saúde, etc.

**Critérios de Aceite:**

* A precisão na extração de valores deve ser alta.

* Toda despesa identificada deve ser associada a uma categoria de investimento.