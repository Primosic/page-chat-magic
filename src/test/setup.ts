import '@testing-library/jest-dom';
import { beforeAll, afterEach, vi } from 'vitest';

// Configurau00e7u00e3o das variu00e1veis de ambiente para os testes
beforeAll(() => {
  // Simula as variu00e1veis de ambiente necessu00e1rias para os testes
  vi.stubEnv('VITE_API_URL', 'http://localhost');
  vi.stubEnv('VITE_API_PORT', '3001');
  vi.stubEnv('VITE_API_ENDPOINT', '/api/v1/prediction/4ba56f30-d33d-48c0-9156-1e83611f261d');
  
  // Mock para objeto import.meta.env
  vi.stubGlobal('import.meta.env', {
    VITE_API_URL: 'http://localhost',
    VITE_API_PORT: '3001',
    VITE_API_ENDPOINT: '/api/v1/prediction/4ba56f30-d33d-48c0-9156-1e83611f261d',
    MODE: 'test'
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
