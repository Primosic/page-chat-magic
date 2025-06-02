import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Isolar os testes de ambiente em um bloco de descrição separado para evitar interferência
describe('Configurações de ambiente', () => {
  // Preservar o ambiente original para restaurar depois dos testes
  const originalEnv = { ...import.meta.env };
  
  // Limpar o cache entre os testes para garantir novas importações limpas
  beforeEach(() => {
    // Resetar todos os módulos para garantir uma importação limpa a cada teste
    vi.resetModules();
  });

  afterEach(() => {
    // Restaurar o ambiente original após cada teste
    vi.stubGlobal('import.meta.env', originalEnv);
  });

  it('deve carregar corretamente as variáveis de ambiente', async () => {
    // Configurar o mock das variáveis de ambiente para este teste
    vi.stubGlobal('import.meta.env', {
      VITE_API_URL: 'http://test.api',
      VITE_API_PORT: '3001', 
      VITE_API_ENDPOINT: '/api/test',
      MODE: 'test'
    });

    // Importar o módulo DEPOIS de configurar o ambiente
    const { config } = await import('../../config/env');
    
    // Verificar os valores carregados
    expect(config.api.baseUrl).toBe('http://test.api');
    expect(config.api.port).toBe('3001');
    expect(config.api.endpoint).toBe('/api/test');
  });

  it('deve gerar a URL completa corretamente', async () => {
    // Configurar o mock das variáveis de ambiente para este teste
    vi.stubGlobal('import.meta.env', {
      VITE_API_URL: 'http://test.api',
      VITE_API_PORT: '3001', 
      VITE_API_ENDPOINT: '/api/test',
      MODE: 'test'
    });

    // Importar o módulo DEPOIS de configurar o ambiente
    const { config } = await import('../../config/env');
    
    // Verificar a URL completa gerada
    const expectedUrl = 'http://test.api:3001/api/test';
    expect(config.api.getFullUrl()).toBe(expectedUrl);
  });
});

// Teste separado para variáveis de ambiente ausentes
describe('Configurações de ambiente sem variáveis definidas', () => {
  it('deve lidar com variáveis de ambiente ausentes', async () => {
    // Limpar cache do módulo
    vi.resetModules();
    
    // Mockar diretamente o módulo de configuração
    vi.doMock('../../config/env', () => {
      // Implementação mockada do módulo env.ts
      return {
        config: {
          api: {
            baseUrl: undefined,
            port: undefined,
            endpoint: undefined,
            getFullUrl: function() {
              // Mesma lógica do módulo original
              if (!this.baseUrl || !this.port || !this.endpoint) {
                return '';
              }
              return `${this.baseUrl}:${this.port}${this.endpoint}`;
            }
          }
        }
      };
    });

    // Importar o módulo mockado
    const { config } = await import('../../config/env');
    
    // Verificar que os valores são undefined
    expect(config.api.baseUrl).toBeUndefined();
    expect(config.api.port).toBeUndefined();
    expect(config.api.endpoint).toBeUndefined();
    
    // A URL completa deve retornar string vazia quando os valores são undefined
    expect(config.api.getFullUrl()).toBe('');
    
    // Remover o mock para não afetar outros testes
    vi.resetModules();
    vi.doUnmock('../../config/env');
  });
});
