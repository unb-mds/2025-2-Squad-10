# OncoMap - Transparência nos investimentos em saúde oncológica

![Versão](https://img.shields.io/badge/version-0.1.0-blue)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![GitHub license](https://img.shields.io/github/license/unb-mds/2025-2-OncoMap)
![GitHub closed issues](https://img.shields.io/github/issues-closed/unb-mds/2025-2-OncoMap)
![GitHub contributors](https://img.shields.io/github/contributors/unb-mds/2025-2-OncoMap)

O OncoMap é uma plataforma interativa que tem como objetivo ampliar a transparência e o acesso a informações sobre os investimentos públicos em saúde oncológica nos municípios brasileiros.

A partir da integração de dados coletados pelo projeto Querido Diário — que reúne e organiza publicações dos diários oficiais municipais —, o OncoMap transforma informações fragmentadas e de difícil acesso em uma visualização clara, intuitiva e acessível.

Por meio de um mapa interativo do Brasil, a ferramenta permite explorar como os recursos destinados à saúde oncológica estão distribuídos nos municípios, possibilitando identificar padrões, desigualdades regionais e tendências nos investimentos.

Nosso propósito é oferecer uma base confiável de dados que possa ser utilizada por pesquisadores, jornalistas, gestores públicos e pela sociedade civil, fortalecendo o controle social, a tomada de decisão informada e a busca por um sistema de saúde mais justo e eficiente.

---

## 📝 Sumário
- [Descrição](#oncomap---transparência-nos-investimentos-em-saúde-oncológica)
- [Status do Projeto](#-status-do-projeto)
- [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [Guia de Configuração](#-guia-de-configuração)
  - [Pré-Requisitos](#-pré-requisitos)
  - [Instalação e Configuração](#-instalação-e-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Equipe](#-equipe)
- [Documentação Extra](#-documentação-extra)

---

## 🚧 Status do Projeto

O projeto encontra-se na versão **`v0.1.0`**, em estágio inicial de desenvolvimento. O foco de trabalho até o momento tem sido na elaboração da documentação, definição de requisitos, prototipação e na estruturação inicial dos ambientes de frontend e backend. As funcionalidades principais da aplicação estão em fase de desenvolvimento.

---

## ✔️ Tecnologias Utilizadas

A seguir estão as principais tecnologias e ferramentas que compõem o OncoMap:

| Categoria | Tecnologia |
| :----------- | :---------------------------------------------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) |
| **Backend** | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white) |
| **Banco de Dados** | ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Ferramentas de Desenvolvimento** | ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white) ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white) |

---

## 🛠 Guia de Configuração 

Siga os passos abaixo para ter uma cópia do projeto rodando em sua máquina.

### 📋 Pré-Requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
- Um gerenciador de pacotes como **NPM** (já vem com o Node.js)
- Um servidor [PostgreSQL](https://www.postgresql.org/) ativo e rodando na sua máquina.

### 🚀 Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/unb-mds/2025-2-OncoMap.git](https://github.com/unb-mds/2025-2-OncoMap.git)
    cd 2025-2-OncoMap
    ```

2.  **Configure o Backend:**
    a. Navegue até a pasta do backend:
    ```bash
    cd Oncomap/backend
    ```
    b. Crie um arquivo `.env` a partir do exemplo. Você pode criar o arquivo e colar o conteúdo abaixo, substituindo com suas credenciais do PostgreSQL:
    ```ini
    # Configurações do Servidor
    PORT=3001

    # URL Base da API Externa
    QUERIDO_DIARIO_API_URL=[https://queridodiario.ok.org.br/api](https://queridodiario.ok.org.br/api)

    # Conexão com o Banco de Dados PostgreSQL
    DB_USER=seu_usuario_postgres
    DB_HOST=localhost
    DB_DATABASE=oncomap_db
    DB_PASSWORD=sua_senha_postgres
    DB_PORT=5432
    ```
    c. Instale as dependências:
    ```bash
    npm install
    ```

3.  **Configure o Frontend:**
    a. Em **outro terminal**, navegue até a pasta do frontend:
    ```bash
    # Partindo da raiz do projeto clonado
    cd Oncomap/frontend
    ```
    b. Instale as dependências:
    ```bash
    npm install
    ```

4.  **Execute a aplicação:**
    * **Para rodar o backend:**
        ```bash
        # No terminal do diretório /Oncomap/backend
        npm run dev 
        ```
        O servidor, inicializado pelo `server.js`, estará rodando. Para verificar, acesse `http://localhost:3001/api/health` em seu navegador. Você deve ver a mensagem: `{"message":"Backend está funcionando!"}`.

    * **Para rodar o frontend:**
        ```bash
        # No terminal do diretório /Oncomap/frontend
        npm run dev
        ```
        Acesse o endereço que aparecer no terminal (geralmente `http://localhost:5173`) para ver a aplicação.
---

## 📁 Estrutura do Projeto
A estrutura do repositório organiza o código-fonte, a documentação e os artefatos do projeto de forma clara. A arquitetura do backend segue o padrão de camadas para separação de responsabilidades.

```plaintext
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

## 👥 Equipe
| [![Felype Carrijo](https://avatars.githubusercontent.com/u/168106790?v=4)](https://github.com/Flyxs) | [![Giovani Coelho](https://avatars.githubusercontent.com/u/176083022?v=4)](https://github.com/Gotc2607) | [![Artur Galdino](https://avatars.githubusercontent.com/u/187340217?v=4)](https://github.com/ArturFGaldino) | [![Luiz](https://avatars.githubusercontent.com/u/212640680?v=4)](https://github.com/Luizz97) | [![João Pedro](https://avatars.githubusercontent.com/u/178330046?v=4)](https://github.com/joaoPedro-201) | [![Gabriel Alexandroni](https://avatars.githubusercontent.com/u/170197026?v=4)](https://github.com/Alexandroni07) |
|:-------------------------------------------------------------:|:-----------------------------------------------------------:|:-----------------------------------------------------------:|:-----------------------------------------------------------:|:-------------------------------------------------------------:|:-------------------------------------------------------------:|
| [Felype Carrijo](https://github.com/Flyxs) | [Giovani Coelho](https://github.com/Gotc2607) | [Artur Galdino](https://github.com/ArturFGaldino) | [Luiz](https://github.com/Luizz97) | [João Pedro](https://github.com/joaoPedro-201) | [Gabriel Alexandroni](https://github.com/Alexandroni07) |

---

## 🎨 Documentação Extra
A documentação de suporte ao projeto, incluindo protótipos e o mapeamento de histórias de usuário, pode ser encontrada nos links abaixo.

- **Story Map:** [Acessar o Story Map no Figma](https://www.figma.com/board/8Jsltq8BOL65CsMoRWFjik/Template-MDS--Copy-?node-id=0-1&p=f&t=qNEzS63nFVyC3kB9-0)
- **Protótipo de Alta Fidelidade:** [Acessar no Figma](https://www.figma.com/design/XyUsffocEKRw7przVsbk0n/Pagina-do-projeto?node-id=0-1&p=f&t=NCglUxCaxCXUAbg9-0)
- **Protótipo de Baixa Fidelidade:** [Acessar no Figma](https://www.figma.com/design/td5oKsmfHCtT9CSPFzKU13/baixa-fidelidada?node-id=0-1&t=gMAdAvQszOHO9gqo-1)
