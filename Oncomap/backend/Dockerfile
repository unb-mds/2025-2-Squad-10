# 1. ESTÁGIO DE BUILD (Usamos uma imagem base do Node)
# node:20-alpine é uma imagem leve e otimizada
FROM node:20-alpine AS build

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de definição de dependências (package.json)
# Isso otimiza o cache do Docker, pulando a reinstalação se não houver mudanças no package.json.
COPY package*.json ./

# Instala as dependências, usando --only=production se for para a imagem final de produção
RUN npm install

# Copia o restante dos arquivos do seu backend (incluindo server.js e a pasta src)
COPY . .

# Expõe a porta que sua aplicação Node.js usa (exemplo: 3000)
EXPOSE 3000

# Comando para rodar a aplicação quando o contêiner iniciar
CMD ["node", "server.js"]