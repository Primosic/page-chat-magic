# Estágio de build
FROM node:18-alpine as build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração de dependências
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY . .

# Gerar build de produção
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos de build para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expor porta 8080
EXPOSE 8080

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
