# Estágio de build
# Usando Node.js 18.18.0 conforme requerido pelas dependências
FROM node:18.18.0-alpine as build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração de dependências
COPY package.json package-lock.json ./

# Instalar dependências com flags para ignorar alertas de compatibilidade
RUN npm ci --no-audit --no-fund --loglevel=error

# Copiar código-fonte
COPY . .

# Substituir a URL da API para o endereço de produção
RUN sed -i 's|http://localhost:3001|http://177.131.143.123:3001|g' src/pages/Index.tsx

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
