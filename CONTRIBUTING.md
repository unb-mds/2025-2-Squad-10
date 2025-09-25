# Guia de Contribuição para o OncoMap

Olá! Ficamos muito felizes com o seu interesse em contribuir para o projeto OncoMap. Toda ajuda é bem-vinda!

Este guia contém as diretrizes para garantir que o processo de contribuição seja o mais simples e organizado possível, tanto para você quanto para nós.

## Código de Conduta

Para garantir um ambiente aberto e acolhedor, adotamos um [Código de Conduta](https://github.com/unb-mds/2025-2-OncoMap/blob/main/software_livre/CODE_OF_CONDUCT.md) que se aplica a todos os contribuidores. Por favor, leia-o antes de participar.


## Como Começar

Para começar, você precisará configurar o ambiente de desenvolvimento localmente. O projeto é dividido em `frontend` (React) e `backend` (Node.js).

### Pré-requisitos

- **Git:** Para clonar o repositório.
- **Node.js:** Versão LTS 20 ou superior.
  - Verifique suas versões com `node -v` e `npm -v`.

### 1. Fork e Clone do Repositório

Primeiro, faça um **Fork** do repositório para a sua conta do GitHub e depois clone o seu fork para a sua máquina:

```bash
git clone [https://github.com/SEU_USUARIO/2025-2-OncoMap.git](https://github.com/SEU_USUARIO/2025-2-OncoMap.git)
cd 2025-2-OncoMap
2. Configurando o Backend
Bash

# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente
# (No Windows, você pode criar o arquivo .env manualmente)
touch .env

# Adicione o seguinte conteúdo ao arquivo .env
PORT=5000
NODE_ENV=development

# Inicie o servidor de desenvolvimento
npm run dev
O backend estará rodando em http://localhost:5000.

3. Configurando o Frontend
Em um novo terminal, navegue até a pasta do frontend a partir da raiz do projeto:

Bash

# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
O frontend estará rodando em http://localhost:5173 (ou outra porta indicada no terminal) e se conectará ao backend.

Enviando sua Contribuição
Para enviar código, siga o fluxo padrão do GitHub.

1. Crie uma Nova Branch
Nunca trabalhe diretamente na branch main. Crie uma branch específica para sua alteração:

Bash

# A partir da branch 'main', crie sua nova branch
git checkout -b tipo/nome-da-sua-feature

# Exemplos de nome:
# git checkout -b feat/tela-de-login
# git checkout -b fix/bug-no-cadastro
Use prefixos como feat/ para novas funcionalidades e fix/ para correção de bugs.

2. Faça suas Alterações
Escreva um código limpo e claro.

Siga os padrões já existentes no projeto.

Recomendamos o uso do Prettier para formatação automática do código, conforme sugerido na documentação.

3. Envie suas Alterações (Commit & Push)
Faça commits pequenos e com mensagens claras, explicando o que foi feito.

Bash

# Adicione os arquivos modificados
git add .

# Faça o commit
git commit -m "feat: Adiciona funcionalidade de login com e-mail"

# Envie para o seu fork no GitHub
git push origin tipo/nome-da-sua-feature
4. Abra um Pull Request
Vá até o repositório original no GitHub. Você verá um aviso para criar um Pull Request a partir da sua branch recém-enviada.

Dê um título claro ao seu Pull Request.

Na descrição, explique o que você fez e por que fez. Se estiver corrigindo uma Issue, mencione o número dela (ex: Corrige #5).

Após o envio, um dos mantenedores do projeto irá revisar seu código e poderá solicitar alterações antes de integrá-lo.

Obrigado por sua contribuição!
