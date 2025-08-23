# Git e GitHub
Git é um sistema de controle de versão distribuído amplamente utilizado no desenvolvimento de software. Ele permite rastrear e gerenciar mudanças em projetos, armazenar o histórico de alterações, reverter para versões anteriores e facilitar a colaboração entre vários desenvolvedores.

GitHub é uma plataforma de hospedagem de código-fonte que utiliza o Git como base. Ele funciona como um espaço na nuvem para armazenar repositórios, possibilitando acessar e compartilhar projetos de qualquer lugar. Além de hospedar código, o GitHub oferece recursos adicionais que potencializam o trabalho em equipe, como por exemplo:

*Pull requests - para revisão e integração de mudanças de forma organizada.
*Issues - para rastreamento de tarefas, bugs e novas funcionalidades.
*Gerenciamento de Branches - permitindo que times trabalhem em paralelo sem afetar o código principal.

## 1. Como configurar o Git

### 1. Baixando o Git

Para utilizarmos o Git, primeiro precisamos baixa-lo.
* Caso esteja utilizando o windowns, será necessáro acessar o [site](https://git-scm.com/downloads/win) e seguir o instalador.
* No linux você terá que abrir o terminal e digitar o comando `sudo apt install git` (Debian/Ubuntu) ou `sudo yum install git` (Fedora/CentOS).

Depois, basta confirmar a instalação usando o comando `git --version` no terminal.

### 2. Configurando o seu Git
Após baixar o Git, será necessário configurar o seu nome e email (eles aparecerão nos commits). Para isso, digite no terminal os seguintes comandos:
`$ git config –global user.name “Seu nome”` e `$ git config –global user.email “Seu email”` substituindo "Seu nome" e "Seu email" com o nome e email que irá utilizar.

Com isso a sua conta deverá estar pronta para ser usada!

## 2. Criando e clonando um repositório

### 1. Criando o repositório
Para criar um arquivo é muito simples, basta entrar no terminal e inserir o comando `mkdir nome_do_projeto` para criar uma pasta onde ficará seu projeto. Após criar a pasta precisamos abri-la com o comando `cd nome_do_projeto` e por fim executar o comando `git init` para criar o repositório.

### 2. Clonando um repositório
Para clonar um repositório existente basta usar o comando `git clone https://github.com/usuario/repositorio.git` trocando "`https://github.com/usuario/repositorio.git`" pelo link do repositório desejado.

## 3. Trabalhando com arquivos

### 1. Preparando o arquivo
Após passar um tempo trabalhando em um projéto, é comum querer salvar ele em um repositório. Para isso, primeiro precisamos preparar o nosso arquivo para isso. Podemos usar o comando `git add nome_arquivo` para escolher um arquivo especifico ou o comando `git add .` para adicionar todos os arquivos.

### 2. Fazendo o commit (salvando mudanças)
Após preparar o arquivo utilizamos o comando `git commit -m "Mensagem explicando as mudanças"` para fazer o commit e salvar o arquivo.

Lembre-se de sempre colocar uma mensagem explicando as alterações mais importantes para que seu projeto siga sempre organizado.

### 3. Extras:
Você pode verificar o status do seu arquivo utilizando o comando `git status`.

Você tambem pode verificar o histórico de commits usando o comando `git log`. 
