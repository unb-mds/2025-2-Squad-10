---
title: "Instalação e Configuração"
draft: false
---

<section class="page-header">
    <h1>Guia de Configuração</h1>
    <p>Siga os passos abaixo para ter uma cópia do projeto rodando em sua máquina.</p>
</section>

<section class="guia-configuracao">
    <section class="requisitos">
        <h2>Pré-Requisitos</h2>
        <p>Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas:</p>
        <ul class="lista-requisitos">
            <li><p><a href="https://git-scm.com" target="_blank" rel="noopener noreferrer">Git</a></p></li>
            <li><p><a href="https://nodejs.org/en/" target="_blank" rel="noopener noreferrer">Node.js</a> (versão LTS recomendada)</p></li>
            <li><p>Um servidor <a href="https://www.postgresql.org/" target="_blank" rel="noopener noreferrer">PostgreSQL</a> ativo e rodando na sua máquina.</p></li>
            <li>Um gerenciador de pacotes como <strong>NPM</strong> (já vem com o Node.js)</li>
        </ul>
    </section>

<section class="instalacao_configuracao">
        <h2>Instalação e Configuração</h2>
        <ol>
            <li class="repositorio">
                <strong>Clone o repositório:</strong>
                <pre><code>git clone https://github.com/unb-mds/2025-2-OncoMap.git
cd 2025-2-OncoMap</code></pre>
            </li>
            <li class="backend">
                <strong>Configure o Backend:</strong>
                <ol>
                    <li>
                        <strong>Navegue até a pasta do backend:</strong>
                        <pre><code>cd Oncomap/backend</code></pre>
                    </li>
                    <li>
                        <strong>Crie um arquivo <code>.env</code> e cole o conteúdo abaixo, substituindo com suas credenciais:</strong>
                        <pre><code>#Configurações do Servidor
PORT=3001

#URL Base da API Externa
QUERIDO_DIARIO_API_URL=https://queridodiario.ok.org.br/api

#Conexão com o Banco de Dados PostgreSQL
DB_USER=seu_usuario_postgres
DB_HOST=localhost
DB_DATABASE=querido_diario_db
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432
                        </code></pre>
                    </li>
                    <li>
                        <strong>Instale as dependências:</strong>
                        <pre><code>npm install</code></pre>
                    </li>
                </ol>
            </li>
            <li class="frontend">
                <strong>Configure o Frontend:</strong>
                <ol>
                    <li>
                        <strong>Em <strong>outro terminal</strong>, navegue até a pasta do frontend:</strong>
                        <pre><code>cd Oncomap/frontend</code></pre>
                    </li>
                    <li>
                        <strong>Instale as dependências:</strong>
                        <pre><code>npm install</code></pre>
                    </li>
                </ol>
            </li>
            <li class="executar">
                <strong>Execute a aplicação:</strong>
                <ol>
                    <li>
                        <strong>Para rodar o backend (no terminal do backend):</strong>
                        <pre><code>npm run dev</code></pre>
                        <p>Para verificar, acesse <code>http://localhost:3001/api/health</code>. Você deve ver: <code>{"message":"Backend está funcionando!"}</code>.</p>
                    </li>
                    <li>
                        <strong>Para rodar o frontend (no terminal do frontend):</strong>
                        <pre><code>npm run dev</code></pre>
                        <p>Acesse o endereço que aparecer no terminal (geralmente <code>http://localhost:5173</code>).</p>
                    </li>
                </ol>
            </li>
        </ol>
    </section>
</section>