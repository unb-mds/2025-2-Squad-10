# OncoMap - Transparência nos investimentos em saúde oncológica

---

## 🚧 Status do Projeto

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)

O projeto **OncoMap** está atualmente em fase de desenvolvimento ativo. As funcionalidades são adicionadas e aprimoradas a cada ciclo (Sprint).

### Funcionalidades Implementadas:
- [x] Configuração da base do backend com Node.js e Express.
- [x] Conexão com o banco de dados PostgreSQL via Sequelize.
- [x] Estrutura inicial do frontend com React e TypeScript.
- [x] Documentação inicial do projeto (README, etc.).

### Próximos Passos:
- [ ] Desenvolvimento da interface do mapa interativo.
- [ ] Criação dos endpoints da API para consulta de dados.
- [ ] Integração do frontend com a API para exibição dos dados.
- [ ] Implementação de filtros de busca (por município, estado, etc.).

---

![GitHub license](https://img.shields.io/github/license/unb-mds/2025-2-OncoMap)
![GitHub closed issues](https://img.shields.io/github/issues-closed/unb-mds/2025-2-OncoMap)
![GitHub contributors](https://img.shields.io/github/contributors/unb-mds/2025-2-OncoMap)

O OncoMap é uma plataforma interativa que tem como objetivo ampliar a transparência e o acesso a informações sobre os investimentos públicos em saúde oncológica nos municípios brasileiros.

A partir da integração de dados coletados pelo projeto Querido Diário — que reúne e organiza publicações dos diários oficiais municipais —, o OncoMap transforma informações fragmentadas e de difícil acesso em uma visualização clara, intuitiva e acessível.

Por meio de um mapa interativo do Brasil, a ferramenta permite explorar como os recursos destinados à saúde oncológica estão distribuídos nos municípios, possibilitando identificar padrões, desigualdades regionais e tendências nos investimentos.

Nosso propósito é oferecer uma base confiável de dados que possa ser utilizada por pesquisadores, jornalistas, gestores públicos e pela sociedade civil, fortalecendo o controle social, a tomada de decisão informada e a busca por um sistema de saúde mais justo e eficiente.

# 📝 Sumário
- [Descrição](#oncomap---transparência-nos-investimentos-em-saúde-oncológica)
- [Sumário](#-sumário)
- [Início](#-início)
  - [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
  - [Guia de Configuração](#-guia-de-configuração)
    - [Pré-Requisitos](#-pré-requisitos)
    - [Instalação e Configuração](#-instalação-e-configuração)
    - [Estrutura do Projeto](#-estrutura-do-projeto)
- [Extras](#-extras)
  - [Equipe](#-equipe)
  - [Story Map](#story-map)
  - [Protótipo](#protótipo)

## 🏁 Início

Esta seção contém todas as informações técnicas para configurar e rodar o projeto localmente.

### ✔️ Tecnologias Utilizadas

A seguir estão as principais tecnologias e ferramentas utilizadas no desenvolvimento do OncoMap, identificadas a partir dos arquivos do projeto:

| Categoria | Tecnologia |
| :----------- | :---------------------------------------------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-blue?style=for-the-badge&logo=axios) |
| **Backend** | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white) |
| **Banco de Dados** | ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Ferramentas de Desenvolvimento** | ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white) ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white) |


### 🛠 Guia de Configuração 

Siga os passos abaixo para ter uma cópia do projeto rodando em sua máquina.

#### 📋 Pré-requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
- Um gerenciador de pacotes como [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- Um servidor [PostgreSQL](https://www.postgresql.org/) ativo na sua máquina.

#### 🚀 Instalação e Configuração

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
    b. Crie uma cópia do arquivo `.env.example` (se existir) para `.env` e preencha com as suas credenciais do PostgreSQL. Se o arquivo não existir, crie um `.env` com o seguinte conteúdo:
    ```ini
    # Configurações do Banco de Dados PostgreSQL
    DB_NAME=oncomap_db
    DB_USER=seu_usuario_postgres
    DB_PASS=sua_senha_postgres
    DB_HOST=localhost
    
    # Porta da API
    API_PORT=3333
    ```
    c. Instale as dependências:
    ```bash
    npm install
    ```

3.  **Configure o Frontend:**
    a. Em outro terminal, navegue até a pasta do frontend:
    ```bash
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
        O servidor estará rodando na porta definida no seu arquivo `.env` (ex: `http://localhost:3333`).
    * **Para rodar o frontend:**
        ```bash
        # No terminal do diretório /Oncomap/frontend
        npm run dev
        ```
        Acesse o endereço que aparecer no terminal (geralmente `http://localhost:5173`) em seu navegador.

### 📁 Estrutura do Projeto
A estrutura do repositório organiza o código-fonte, a documentação e os artefatos do projeto de forma clara.
````

.
├── ATA DE REUNIÕES/     \# Atas e registros das reuniões de Sprint
├── doc/                 \# Documentação técnica e de requisitos
│   ├── backend/
│   ├── frontend/
│   ├── metodologias/
│   └── requisitos/
├── Oncomap/             \# Diretório principal com o código-fonte da aplicação
│   ├── backend/         \# Código do servidor (API, banco de dados)
│   └── frontend/        \# Código da interface do usuário (React + TS)
├── CODE\_OF\_CONDUCT.md   \# Código de conduta para contribuidores
├── CONTRIBUTING.md      \# Guia de como contribuir com o projeto
├── LICENSE              \# Licença do projeto
├── README.md            \# Este arquivo
└── SECURITY.md          \# Política de segurança

```

## ✨ Extras

### 👥 Equipe
| [![Felype Carrijo](https://avatars.githubusercontent.com/u/168106790?v=4)](https://github.com/Flyxs) | [![Giovani Coelho](https://avatars.githubusercontent.com/u/176083022?v=4)](https://github.com/Gotc2607) | [![Artur Galdino](https://avatars.githubusercontent.com/u/187340217?v=4)](https://github.com/ArturFGaldino) | [![Luiz](https://avatars.githubusercontent.com/u/212640680?v=4)](https://github.com/Luizz97) | [![João Pedro](https://avatars.githubusercontent.com/u/178330046?v=4)](https://github.com/joaoPedro-201) | [![Gabriel Alexandroni](https://avatars.githubusercontent.com/u/170197026?v=4)](https://github.com/Alexandroni07) |
|:-------------------------------------------------------------:|:-----------------------------------------------------------:|:-----------------------------------------------------------:|:-----------------------------------------------------------:|:-------------------------------------------------------------:|:-------------------------------------------------------------:|
| [Felype Carrijo](https://github.com/Flyxs) | [Giovani Coelho](https://github.com/Gotc2607) | [Arthur Galdino](https://github.com/ArturFGaldino) | [Luiz](https://github.com/Luizz97) | [João Pedro](https://github.com/joaoPedro-201) | [Gabriel Alexandroni](https://github.com/Alexandroni07) |


### Story Map

O mapeamento de histórias de usuário, que guiou o desenvolvimento das funcionalidades, pode ser acessado em nosso board no Figma.
- **[Acessar o Story Map](https://www.figma.com/board/8Jsltq8BOL65CsMoRWFjik/Template-MDS--Copy-?node-id=0-1&p=f&t=qNEzS63nFVyC3kB9-0)**

### Protótipo
Os protótipos de baixa e alta fidelidade foram essenciais para a validação do design e da experiência do usuário.
- **[Protótipo de Alta Fidelidade](https://www.figma.com/design/XyUsffocEKRw7przVsbk0n/Pagina-do-projeto?node-id=0-1&p=f&t=NCglUxCaxCXUAbg9-0)**
- **[Protótipo de Baixa Fidelidade](https://www.figma.com/design/td5oKsmfHCtT9CSPFzKU13/baixa-fidelidada?node-id=0-1&t=gMAdAvQszOHO9gqo-1)**

```