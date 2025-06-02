# Guia de Instalação do Docker no Ubuntu Server

Este guia contém instruções para instalar o Docker e o Docker Compose em um servidor Ubuntu, permitindo executar a aplicação Chat DPP sem depender da versão do Node.js instalada no servidor.

## Instalação do Docker

```bash
# Atualizar os repositórios
sudo apt-get update

# Instalar pacotes de pré-requisitos
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Adicionar a chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Configurar repositório estável
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Atualizar novamente e instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Verificar se o Docker foi instalado corretamente
sudo docker --version

# Adicionar seu usuário ao grupo docker (opcional, para executar docker sem sudo)
sudo usermod -aG docker $USER

# Aplicar as alterações de grupo (necessário fazer logout e login novamente)
# Ou execute o comando abaixo para aplicar as alterações na sessão atual
newgrp docker
```

## Instalação do Docker Compose

```bash
# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Aplicar permissões executáveis
sudo chmod +x /usr/local/bin/docker-compose

# Verificar a instalação
docker-compose --version
```

## Implantação do Chat DPP com Docker

Após instalar o Docker, siga estas etapas para implantar a aplicação:

1. **Clone o repositório (se ainda não fez isso)**
   ```bash
   git clone <URL_DO_REPOSITÓRIO>
   cd page-chat-magic
   ```

2. **Construa a imagem Docker**
   ```bash
   sudo docker build -t chat-dpp:latest .
   ```

3. **Execute o container**
   ```bash
   sudo docker run -d -p 8080:8080 --name chat-dpp chat-dpp:latest
   ```

4. **Verifique se está funcionando**
   ```bash
   sudo docker ps
   ```

5. **Acesse a aplicação**
   http://seu-servidor:8080

## Solução de problemas comuns

### Problemas de permissão
```bash
# Se ocorrer problemas de permissão ao executar comandos docker
sudo chmod 666 /var/run/docker.sock
```

### Espaço em disco
```bash
# Verificar espaço usado pelo Docker
sudo docker system df

# Limpar recursos não utilizados
sudo docker system prune -a --volumes
```

### Visualizar logs
```bash
# Ver logs do container
sudo docker logs chat-dpp

# Ver logs em tempo real
sudo docker logs -f chat-dpp
```

### Reiniciar serviços
```bash
# Reiniciar o Docker
sudo systemctl restart docker

# Reiniciar o container
sudo docker restart chat-dpp
```
