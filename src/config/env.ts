/**
 * Arquivo de configuração para gerenciar variáveis de ambiente
 * 
 * Centraliza o acesso a todas as variáveis de ambiente do projeto
 * facilitando a manutenção e proporcionando tipagem correta
 */

export const config = {
  api: {
    // URL base da API (incluindo protocolo)
    baseUrl: import.meta.env.VITE_API_URL as string | undefined,
    // Porta da API
    port: import.meta.env.VITE_API_PORT as string | undefined,
    // Endpoint da API para predições - usado como URL completa nesta configuração
    endpoint: import.meta.env.VITE_API_ENDPOINT as string | undefined,
    // URL completa para a API (usando apenas o endpoint)
    getFullUrl: function() {
      // Verificar se o endpoint está definido
      if (!this.endpoint) {
        console.warn('Endpoint da API não configurado');
        return '';
      }
      
      // Motivo: Utilizando apenas o VITE_API_ENDPOINT como URL completa para testes
      console.log('Usando endpoint como URL completa:', this.endpoint);
      return this.endpoint;
    }
  }
};
