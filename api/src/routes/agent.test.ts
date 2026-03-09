import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// Helper to set environment variables for tests
const setEnv = (overrides: Record<string, string | undefined>) => {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
};

describe('Agent chat API', () => {
  let app: express.Express;

  beforeEach(async () => {
    // Clear module cache so env vars are re-read in each test
    vi.resetModules();
    app = express();
    app.use(express.json());
    const { default: agentRouter } = await import('./agent');
    app.use('/agent', agentRouter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setEnv({
      AZURE_FOUNDRY_ENDPOINT: undefined,
      AZURE_FOUNDRY_API_KEY: undefined,
      AZURE_FOUNDRY_MODEL: undefined,
    });
  });

  it('returns 400 when message is missing', async () => {
    const response = await request(app).post('/agent/chat').send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('returns 400 when message is an empty string', async () => {
    const response = await request(app)
      .post('/agent/chat')
      .send({ message: '   ' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('returns 500 when Foundry credentials are not configured', async () => {
    setEnv({ AZURE_FOUNDRY_ENDPOINT: undefined, AZURE_FOUNDRY_API_KEY: undefined });
    const response = await request(app)
      .post('/agent/chat')
      .send({ message: 'Hello' });
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('returns 500 when only endpoint is set (no key)', async () => {
    setEnv({
      AZURE_FOUNDRY_ENDPOINT: 'https://example.openai.azure.com',
      AZURE_FOUNDRY_API_KEY: undefined,
    });
    const response = await request(app)
      .post('/agent/chat')
      .send({ message: 'Hello' });
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('returns 500 when upstream AI call fails', async () => {
    setEnv({
      AZURE_FOUNDRY_ENDPOINT: 'https://example.openai.azure.com',
      AZURE_FOUNDRY_API_KEY: 'test-key',
    });

    // The endpoint is unreachable in test; expect graceful 500 error handling
    const response = await request(app)
      .post('/agent/chat')
      .send({ message: 'Where is my order?' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});
