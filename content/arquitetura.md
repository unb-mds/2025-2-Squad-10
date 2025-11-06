---
title: "Arquitetura"
subtitulo: "Documentação da Arquitetura do projeto OncoMap"
draft: false
layout: "embed"  # <-- Isso usa o layout 'embed.html'

#
# CORREÇÃO: Todo o 'blocos_de_texto' agora está DENTRO do Front Matter
#
blocos_de_texto:
  - titulo: "Arquitetura Atual"
    texto: |
      ### Frontend
      - Next.js
      - React
      - Css
      ### Backend
      ### Integrações Externas
      - Querido Diário API

  - titulo: "Estrutura de Componentes"
    texto: |
      ```
      .
      └── 2025-2-OncoMap/
          ├── ATA DE REUNIÕES/
          ├── doc/
          ├── Oncomap/
          │   ├── backend/
          │   │   ├── src/
          │   │   │   ├── api/             # Camada da API: rotas, controllers e middlewares
          │   │   │   ├── config/          # Arquivos de configuração (ex: conexão com banco)
          │   │   │   ├── database/        # Models, migrations e seeders do Sequelize
          │   │   │   ├── scripts/         # Scripts utilitários (ex: coletor de dados da API externa)
          │   │   │   └── app.js           # Arquivo principal de configuração do Express
          │   │   ├── .env               # Arquivo de variáveis de ambiente (NÃO versionado)
          │   │   ├── package.json
          │   │   └── server.js          # Ponto de entrada da aplicação (inicializa o servidor)
          │   └── frontend/              # Código da interface do usuário (React + TS)
          ├── CODE_OF_CONDUCT.md
          ├── CONTRIBUTING.md
          ├── LICENSE
          ├── README.md
          └── SECURITY.md
      ```

  - titulo: "Padrões Arquiteturais"
    texto: |
      (Preencha os padrões arquiteturais aqui...)

  - titulo: "Diagrama"
    texto: |
      <img src="/images/arquitetura/diagrama1.png" alt="Diagrama 1" style="width: 70%; display: block; margin-left: auto; margin-right: auto;">

      <img src="/images/arquitetura/diagrama2.png" alt="Diagrama 2" style="width: 70%; display: block; margin-left: auto; margin-right: auto;">

      <img src="/images/arquitetura/diagrama3.png" alt="Diagrama 3" style="width: 70%; display: block; margin-left: auto; margin-right: auto;">
---
