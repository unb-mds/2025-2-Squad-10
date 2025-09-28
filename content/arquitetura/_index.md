---
title: "Arquitetura"
draft: false
---

<section class="page-header">
    <h1>Arquitetura</h1>
    <p>Descrição da arquitetura do sistema OncoMap, incluindo componentes principais e fluxos de dados.</p>
</section>

<section class="arquitetura">

<section class="visao-geral">

<h2>Visão Geral da Arquitetura</h2>
<p>O sistema OncoMap é composto por três componentes principais: o frontend, o backend e o banco de dados. A seguir, uma visão geral de cada componente e como eles interagem entre si.</p>

<h3>Frontend</h3>
<p>O frontend é responsável pela interface do usuário, permitindo que os usuários interajam com o sistema. Ele é desenvolvido utilizando tecnologias web modernas, garantindo uma experiência de usuário fluida e responsiva.</p>
<h3>Backend</h3>
<p>O backend gerencia a lógica de negócios, processa as solicitações do frontend e interage com o banco de dados. Ele é construído utilizando Node.js e Express, proporcionando uma API RESTful eficiente.</p>

<h3>Banco de Dados</h3>
<p>O banco de dados utilizado é o PostgreSQL, que armazena todas as informações necessárias para o funcionamento do sistema, incluindo dados dos diários oficiais municipais e informações sobre investimentos em saúde oncológica.</p>

</section>

<section class="fluxo-dados">
<h2>Fluxo de Dados</h2>
<p>O fluxo de dados no sistema OncoMap segue os seguintes passos:</p>
<ol>
    <li>O usuário acessa a interface do frontend através do navegador.</li>
    <li>O frontend envia solicitações ao backend para buscar ou enviar dados.</li>
    <li>O backend processa as solicitações, executa a lógica de negócios necessária e interage com o banco de dados conforme necessário.</li>
    <li>Os dados são retornados ao frontend, que os apresenta ao usuário de forma clara e acessível.</li>
</ol>
</section>

<section class="diagrama-arquitetura">
<h2>Diagrama da Arquitetura</h2>
<p>Abaixo está um diagrama simplificado que ilustra a arquitetura do sistema OncoMap:</p>
<pre><code>
└── 2025-2-OncoMap/
    ├── ATA DE REUNIÕES/     # Atas e registros das reuniões de Sprint
    ├── doc/                 # Documentação técnica (arquitetura, requisitos, etc.)
    ├── Oncomap/             # Diretório principal com o código-fonte da aplicação
    │   ├── backend/         # Código do servidor (API, banco de dados)
    │   └── frontend/        # Código da interface do usuário (React + TS)
    ├── CODE_OF_CONDUCT.md   # Código de conduta para contribuidores
    ├── CONTRIBUTING.md      # Guia de como contribuir com o projeto
    ├── LICENSE              # Licença do projeto
    ├── README.md            # Este arquivo
    └── SECURITY.md          # Política de segurança
</code></pre>
</section>

</section>