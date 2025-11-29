# ESTÁGIO 1: BUILD (Compilação da Aplicação Frontend)

# Usamos uma imagem Node completa para o processo de build, pois ela contém o npm/yarn.
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia e instala as dependências
# Isso aproveita o cache: se package.json não mudar, o Docker não repete o npm install.
COPY package*.json ./
RUN npm install

# Copia o restante do código-fonte (incluindo a pasta src)
COPY . .

# Comando que executa o script de build da sua aplicação (React/Vue/Angular)
# O output (geralmente na pasta 'dist' ou 'build') será o código estático final.
# Altere 'build' para o nome do seu script de build, se for diferente (ex: 'npm run prod')
RUN npm run build 

# ESTÁGIO 2: PRODUÇÃO (Serviço dos Arquivos Estáticos)

# Usamos a imagem oficial do NGINX, que é ideal para servir conteúdo estático.
FROM nginx:alpine AS production

# Remove a página de boas-vindas padrão do NGINX
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos estáticos COMPILADOS do estágio 'builder' para a pasta do NGINX
# O 'dist' deve ser o nome da pasta de output do seu 'npm run build' (mude se for 'build')
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia o arquivo de configuração customizado do NGINX (iremos criá-lo no próximo passo)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# O NGINX já expõe a porta 80 por padrão
EXPOSE 80

# O comando padrão do NGINX inicia o servidor
CMD ["nginx", "-g", "daemon off;"]