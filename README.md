# Assistente de IA do DPP (Data Privacy Platform)

## Sobre o Projeto

Este projeto implementa uma interface de chat para interagir com um assistente de IA especializado em privacidade de dados. A aplicação foi desenvolvida para o DPP (Data Privacy Platform), oferecendo uma experiência de usuário moderna e intuitiva.

### Principais Funcionalidades

- **Interface de Chat Responsiva**: Design moderno com suporte a dispositivos móveis e desktop
- **Tema Claro/Escuro**: Alternância entre perspectivas visuais clara e escura, com estilos otimizados para cada tema
- **Logotipos Contextuais**: Alternância automática de logotipos com base no tema selecionado
- **Formatação Markdown**: Suporte completo para formatação Markdown nas respostas do assistente
- **Layout Otimizado**: Cabeçalho e barra lateral sempre visíveis, com área de mensagens com rolagem independente
- **Foco Automático**: Cursor sempre direcionado para o campo de entrada do usuário
- **Comunicação com API**: Integração com API externa para processamento de mensagens
- **Identidade Visual Consistente**: Favicon na aba do navegador e elementos visuais alinhados com a identidade da marca
- **Sistema de Autenticação**: Tela de login com credenciais predefinidas para controle de acesso
- **Mecanismo de Segurança**: Limite de cinco tentativas de login com bloqueio temporário
- **Proteção de Rotas**: Acesso ao chat condicionado à autenticação bem-sucedida

### Requisitos Técnicos

- API de backend rodando em `localhost:3001` para processamento das mensagens

## Tecnologias Utilizadas

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Markdown + remark-gfm
- next-themes (sistema de temas claro/escuro)

## Como executar o projeto localmente

Para executar este projeto localmente, siga os passos abaixo:

```sh
# 1. Clone o repositório
git clone <URL_DO_REPOSITÓRIO>

# 2. Navegue até o diretório do projeto
cd page-chat-magic

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Requisições do Servidor

A aplicação depende de um servidor backend rodando em `localhost:3001` que provê a API para processamento das mensagens. Certifique-se de que o servidor esteja em execução antes de testar a aplicação.

## Estrutura do Projeto

```
src/
├── components/  # Componentes reutilizáveis da UI
├── hooks/       # Hooks personalizados
├── lib/         # Utilitários e funções auxiliares
├── pages/       # Páginas da aplicação
│   ├── Index.tsx  # Página principal do chat
│   └── NotFound.tsx # Página de erro 404
├── App.tsx      # Componente principal da aplicação
├── main.tsx     # Ponto de entrada da aplicação
└── index.css    # Estilos globais

public/
├── images/      # Imagens estáticas
│   ├── simbolo_sdna.png # Logo no cabeçalho
│   └── 1-min-3.png      # Logo na barra lateral
└── ...           # Outros recursos estáticos
```

## Funcionalidades Detalhadas

### 1. Sistema de Temas (Claro/Escuro)

- **Alternância Simples**: Botão dedicado no cabeçalho para alternar entre temas
- **Persistência**: Tema selecionado é salvo nas preferências do navegador
- **Preferências do Sistema**: Suporte à detecção automática do tema do sistema operacional
- **Adaptação Visual Completa**:
  - Cores de fundo ajustadas para cada tema (branco no tema claro, cinza escuro no tema escuro)
  - Elementos de interface com contraste otimizado para cada tema
  - Botão "Nova Conversa" com background verde claro no tema claro
  - Balões de mensagens com tons mais suaves no tema claro

### 2. Logotipos Contextuais

- **Alternância Automática**: Logotipos mudam automaticamente com base no tema ativo
  - Tema escuro: utiliza o logotipo `1-min-3.png`
  - Tema claro: utiliza o logotipo `logo_2.png`
- **Identidade Visual**: Favicon na aba do navegador utilizando a imagem `simbolo_sdna.png`

### 3. Interface de Chat

- **Design Responsivo**: Interface otimizada para dispositivos móveis e desktop
- **Layout Fixo**: Cabeçalho e barra lateral permanecem visíveis independentemente do tamanho da conversa
- **Área de Rolagem**: Apenas a área de mensagens possui rolagem, mantendo controles importantes sempre acessíveis
- **Foco Automático**: O cursor é automaticamente direcionado para o campo de entrada após:
  - Carregamento da página
  - Envio de mensagens
  - Recebimento de respostas do assistente
  - Clique em outras áreas da interface

### 2. Formatação de Mensagens

- **Suporte a Markdown**: Permite exibição formatada das respostas do assistente com:
  - Cabeçalhos (h1, h2, h3)
  - Listas ordenadas e não-ordenadas
  - Código inline e blocos de código
  - Links com estilo especial e abertura em nova aba
  - Tabelas com formatação adequada
  - Citações
  - Divisões horizontais

### 3. Integração com API

- **Comunicação Assíncrona**: Integração com API externa para processamento das mensagens
- **Indicador de Carregamento**: Feedback visual durante o processamento da mensagem
- **Tratamento de Erros**: Notificações amigáveis em caso de falha na conexão

### 4. Identidade Visual

- **Logos Personalizados**: Implementação de logotipos nos pontos-chave da interface
- **Esquema de Cores**: Cores consistentes alinhadas com a identidade do produto
- **Iconografia**: Uso de ícones intuitivos para melhor experiência do usuário

## Considerações Técnicas

### Desempenho

- **Renderização Eficiente**: Uso de referências e estado do React para otimizar renderizações
- **Componentes Reutilizáveis**: Utilização da biblioteca Shadcn UI para componentes consistentes
- **Estilização Otimizada**: CSS via Tailwind para gerar apenas os estilos necessários

### Manutenibilidade

- **Estrutura Organizada**: Separação clara de responsabilidades
- **Código Limpo**: Implementação seguindo princípios SOLID, DRY e KISS
- **Componentização**: Divisão em componentes com responsabilidades únicas

### Segurança

- **Links Externos**: Configuração apropriada de `rel="noopener noreferrer"` para links
- **Processamento de Conteúdo**: Uso seguro de formatação Markdown

### 5. Sistema de Autenticação

- **Tela de Login Dedicada**: Interface moderna com o logotipo no tema escuro
- **Credenciais Predefinidas**: Acesso mediante usuário e senha configurados (credenciais não divulgadas na documentação por segurança)
- **Limite de Tentativas**: Máximo de 5 tentativas de login permitidas
- **Bloqueio Temporário**: Bloqueio por 15 minutos após exceder o limite de tentativas
- **Contador Regressivo**: Exibição do tempo restante até nova tentativa ser permitida
- **Feedback Visual**: Indicação clara de erros e instruções para contato com suporte
- **Persistência de Status**: Estado de autenticação e bloqueio mantidos via localStorage
- **Botão de Logout**: Opção para encerrar sessão no cabeçalho da interface principal
- **Tratamento de Entrada**: Remoção automática de espaços extras e insensibilidade a maiúsculas/minúsculas
- **Auditoria de Login**: Registro das últimas 10 tentativas de login com data/hora e resultado

### 6. Proteção de Rotas

- **Redirecionamento Automático**: Usuários não autenticados são direcionados para a tela de login
- **Componente ProtectedRoute**: Implementação dedicada para verificação de status de autenticação
- **Navegação Segura**: Acesso ao chat somente após login bem-sucedido

## Próximos Passos

- Histórico de conversas persistente
- Exportação de conversas
- Perfis de usuário personalizados
- Integração com bases de conhecimento adicionais
- Autenticação com serviços externos (OAuth)
- Mecanismo de recuperação de senha
