# Guia de Setup e Implantau00e7u00e3o - Chat DPP

## Requisitos do Sistema

- Node.js 16.x ou superior
- NPM 8.x ou superior
- API backend rodando em `localhost:3001` ou configurada via varu00edu00e1veis de ambiente

## Instalu00e7u00e3o e Execuu00e7u00e3o Local

### 1. Clonar o repositu00f3rio

```bash
git clone <URL_DO_REPOSITÓRIO>
cd page-chat-magic
```

### 2. Instalar dependu00eancias

```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento estaru00e1 disponivel em http://localhost:8080.

### 4. Configurar API backend

A aplicau00e7u00e3o estará configurada para se comunicar com um servidor backend em `localhost:3001`. Certifique-se de que a API esteja em execuu00e7u00e3o antes de testar a aplicau00e7u00e3o.

## Build para Produu00e7u00e3o

### 1. Gerar build otimizado

```bash
npm run build
```

Os arquivos de build seru00e3o gerados na pasta `dist/` e estaru00e3o prontos para implantau00e7u00e3o.

### 2. Testar build localmente

```bash
npm run preview
```

Este comando permite verificar se o build de produu00e7u00e3o estará funcionando corretamente antes da implantau00e7u00e3o.

## Implantação em Produção

### Opação 1: Docker (Recomendado para todos os ambientes)

Este projeto inclui configurações para implantação via Docker, executando na porta 8080. Esta é a opção **recomendada** especialmente para servidores Ubuntu com versões antigas do Node.js (como v12.x).

#### Requisitos mínimos:
- Docker 19.03.0 ou superior
- Docker Compose 1.27.0 ou superior (opcional)

#### 1. Construir a imagem Docker

```bash
sudo docker build -t chat-dpp:latest .
```

#### 2. Executar o container

```bash
# Execução básica na porta 8080
sudo docker run -d -p 8080:8080 --name chat-dpp chat-dpp:latest

# Para verificar os logs do container
sudo docker logs chat-dpp
```

#### 3. Verificar se o container está em execução

```bash
sudo docker ps
```

#### 4. Acessar a aplicação

Acesse http://localhost:8080 ou http://[seu-ip-servidor]:8080

#### 5. Gerenciar o container

```bash
# Parar o container
sudo docker stop chat-dpp

# Reiniciar o container
sudo docker restart chat-dpp

# Remover o container
sudo docker rm -f chat-dpp
```

### Docker Compose (Ambiente com Múltiplos Serviços)

Se você precisar executar tanto o frontend quanto a API backend, você pode usar Docker Compose. Crie um arquivo `docker-compose.yml` na raiz do projeto:

```yaml
version: '3'
services:
  frontend:
    build: .
    ports:
      - "8080:8080"
    restart: always
  
  # Descomente se quiser executar a API no mesmo ambiente
  # api:
  #   image: [imagem-da-sua-api]
  #   ports:
  #     - "3001:3001"
  #   volumes:
  #     - api-data:/data

# volumes:
#   api-data:
```

Para executar:

```bash
sudo docker-compose up -d
```

### Opação 2: Servidor Web Estático (Nginx, Apache)

1. Copie o conteúdo da pasta `dist/` para o diretório de hospedagem do seu servidor web

   ```bash
   # Exemplo para servidor NGINX
   cp -r dist/* /var/www/html/
   ```

2. Configure o servidor para redirecionar todas as solicitau00e7u00f5es para `index.html` para suportar o roteamento no lado do cliente:

   ```nginx
   # Exemplo de configurau00e7u00e3o NGINX
   server {
     listen 80;
     server_name seu-dominio.com;
     root /var/www/html;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

### Opa00e7u00e3o 2: Serviços de Hospedagem Estática (Netlify, Vercel, GitHub Pages)

1. Configure o script de build no `package.json` (já configurado neste projeto)

2. Conecte seu repositório ao serviço de hospedagem escolhido

3. Configure as variáveis de ambiente para apontar para a API correta

   ```
   VITE_API_URL=https://api.seudominio.com
   ```

4. Implante com comando específico do serviço ou via integração contínua

   ```bash
   # Exemplo Netlify CLI
   netlify deploy --prod
   ```

## Credenciais de Acesso

A aplicação possui um sistema de login com as seguintes credenciais predefinidas:

- **Usuário**: `privacidade`
- **Senha**: `dpp@2025`

> **Importante**: Para ambiente de produção, é recomendável alterar estas credenciais. As credenciais podem ser modificadas no arquivo `/src/pages/Login.tsx`.

## Configuração do Backend

Para que a aplicação funcione corretamente, a API backend precisa estar configurada para:

1. Aceitar requisições POST em `/api/chat`
2. Processar mensagens no formato:
   ```json
   {
     "question": "texto da pergunta do usuário"
   }
   ```
3. Retornar respostas no formato:
   ```json
   {
     "answer": "texto da resposta do assistente"
   }
   ```

## Solução de Problemas

### O login não funciona

- Verifique se está utilizando as credenciais corretas: `privacidade` / `dpp@2025`
- Se estiver bloqueado por excesso de tentativas, aguarde 15 minutos ou limpe o localStorage do navegador

### A aplicação não se conecta à API

- Verifique se o servidor backend está em execução em `localhost:3001`
- Verifique se o CORS está configurado corretamente no servidor backend
- Revise os logs no console do navegador para identificar erros específicos

### A página carrega em branco

- Verifique se todos os recursos estáticos estão disponíveis (imagens, CSS, JS)
- Certifique-se de que a configuração do servidor web está redirecionando corretamente para index.html

## Estrutura de Arquivos da Build

```
dist/
├── assets/       # Arquivos JS e CSS compilados com hash para cache
├── images/       # Imagens e recursos estáticos
│   ├── 1-min-3.png      # Logo tema escuro
│   ├── logo_2.png       # Logo tema claro
│   └── simbolo_sdna.png # Favicon
├── favicon.ico  # Ícone da aplicação
├── index.html   # Ponto de entrada HTML
└── robots.txt   # Configurações para crawlers
```

## Atualizações e Manutenção

### Atualização da Aplicação

1. Faça o pull das novas alterações do repositório
   ```bash
   git pull origin main
   ```

2. Instale possíveis novas dependências
   ```bash
   npm install
   ```

3. Gere um novo build
   ```bash
   npm run build
   ```

4. Implante os novos arquivos para produção

### Backup

Recomenda-se manter backups regulares dos seguintes elementos:

- Código-fonte completo
- Configurações personalizadas de implantação
- Arquivos de build para rápida restauração em caso de falha

## Suporte

Para suporte técnico, entre em contato com:

- Email: corporate@sdnadigital.com
- Responsável: Equipe de Desenvolvimento DPP
