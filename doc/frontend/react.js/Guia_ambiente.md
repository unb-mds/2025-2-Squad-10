# Frontend 

## Instalando Vite e Criando um Projeto React

Este guia explica como instalar o **Vite** e iniciar um novo projeto
**React** passo a passo.

------------------------------------------------------------------------

## Pré-requisitos

-   **Node.js** (versão LTS recomendada -- 20 ou superior).\
    Verifique se está instalado:

    ``` bash
    node -v
    npm -v
    ```

    Caso não esteja instalado, baixe pelo [site
    oficial](https://nodejs.org) ou use o gerenciador de pacotes da sua
    distribuição Linux.

------------------------------------------------------------------------

## Criar o projeto com Vite

1.  Abra o terminal na pasta onde deseja criar o projeto.

2.  Execute:

    ``` bash
    npm create vite@latest nome-do-projeto
    ```

3.  Escolha:

    -   **Framework**: `React`
    -   **Variante**: `JavaScript` ou `TypeScript` (conforme sua
        preferência).

4.  Entre na pasta do projeto:

    ``` bash
    cd nome-do-projeto
    ```

5.  Instale as dependências:

    ``` bash
    npm install
    ```

------------------------------------------------------------------------

## Rodar o servidor de desenvolvimento

Execute:

``` bash
npm run dev
```

O terminal mostrará algo como:

    Local:   http://localhost:5173/

Abra esse endereço no navegador para visualizar o projeto rodando.

------------------------------------------------------------------------

## Estrutura inicial do projeto com vite 

    nome-do-projeto/
    ├─ public/           # Arquivos públicos (favicon, logos)
    ├─ src/              # Código-fonte React
    │  ├─ App.jsx/tsx    # Componente principal
    │  ├─ main.jsx/tsx   # Ponto de entrada da aplicação
    │  └─ index.css      # Estilos globais
    ├─ package.json      # Dependências e scripts
    └─ vite.config.js    # Configuração do Vite

------------------------------------------------------------------------

## Dicas úteis

-   Extensão **ES7+ React/Redux snippets** no VS Code para criar
    componentes rapidamente.
-   Use **Prettier** para formatar automaticamente o código.

------------------------------------------------------------------------

# Backend

## 1. Criar diretório do backend

``` bash
mkdir backend
cd backend
```
-------------------------------------------------------------------------

## 2. Inicializar projeto Node.js

``` bash
npm init -y
```
--------------------------------------------------------------------------

## 3. Instalar dependências

``` bash
npm install express cors dotenv
npm install -D nodemon
```
--------------------------------------------------------------------------

## 4. Criar arquivo principal (src/index.js)

```bash
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend está funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
```
