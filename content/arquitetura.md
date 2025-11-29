---
title: "Arquitetura"
subtitulo: "Documentação da Arquitetura do projeto OncoMap"
draft: false
layout: "embed"  # <-- Isso usa o layout 'embed.html'

#
# CORREÇÃO: Todo o 'blocos_de_texto' agora está DENTRO do Front Matter
#
blocos_de_texto:
  - titulo: "Arquitetura Lógica da Solução"
    texto: |
      A solução **OncoMap** segue um modelo de **Arquitetura em Camadas** (Tiered Architecture), separando a interface do usuário (Frontend) da lógica de negócios (Backend) e do armazenamento de dados (Banco de Dados).
      
      Abaixo está o diagrama de alto nível que ilustra a interação entre os principais componentes do sistema. 
      * **Frontend (Apresentação):** Responsável pela interface e experiência do usuário.
      * **Backend (Lógica de Negócios):** Servidor API RESTful que orquestra as regras de negócio e a persistência de dados.
      * **Banco de Dados (Persistência):** Armazena todas as informações clínicas e de usuário.
      

  - titulo: "Stack Tecnológico"
    texto: |
      As seguintes tecnologias foram escolhidas para compor o projeto, visando **desempenho, escalabilidade e facilidade de manutenção**:
      
      ### 🖥️ Frontend (Interface)
      
      ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
      ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
      ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
      
      ### ⚙️ Backend (API e Lógica)
      
      ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
      ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
      ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
      
      ### 🗄️ Banco de Dados (Persistência)
      
      ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
      
      ### 🛠️ Ferramentas de Desenvolvimento
      
      ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
      ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white)
      ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)
      

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
