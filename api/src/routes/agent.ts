/**
 * @swagger
 * tags:
 *   name: Agent
 *   description: AI customer service agent powered by Azure AI Foundry
 */

/**
 * @swagger
 * /api/agent/chat:
 *   post:
 *     summary: Send a message to the AI customer service agent
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's chat message
 *               history:
 *                 type: array
 *                 description: Prior conversation turns
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Agent reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   description: The agent's response message
 *       400:
 *         description: Missing required field
 *       500:
 *         description: Internal server error or upstream AI service unavailable
 */

import express, { Request, Response } from 'express';
import https from 'https';
import http from 'http';

const router = express.Router();

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

/**
 * POST /api/agent/chat
 * Proxies the user prompt to the configured Azure AI Foundry endpoint and
 * returns the assistant reply. Falls back to a safe error message when the
 * upstream service is unavailable or misconfigured.
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message, history = [] }: ChatRequest = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const foundryEndpoint = process.env.AZURE_FOUNDRY_ENDPOINT;
  const foundryApiKey = process.env.AZURE_FOUNDRY_API_KEY;
  const foundryModel = process.env.AZURE_FOUNDRY_MODEL || 'gpt-4o';

  if (!foundryEndpoint || !foundryApiKey) {
    res.status(500).json({
      error: 'AI service is not configured. Please contact support.',
    });
    return;
  }

  const systemPrompt: ChatMessage = {
    role: 'system',
    content:
      'You are a helpful customer service assistant for OctoCAT Supply, a smart cat technology company. ' +
      'You help customers with product questions, order status inquiries, and general support. ' +
      'Keep responses concise and friendly.',
  };

  const messages: ChatMessage[] = [
    systemPrompt,
    ...history,
    { role: 'user', content: message.trim() },
  ];

  const requestBody = JSON.stringify({
    model: foundryModel,
    messages,
    max_tokens: 512,
    temperature: 0.7,
  });

  try {
    const reply = await callFoundryEndpoint(
      foundryEndpoint,
      foundryApiKey,
      requestBody
    );
    res.json({ reply });
  } catch (err) {
    console.error('Agent chat error:', err);
    res.status(500).json({
      error: 'The AI service is temporarily unavailable. Please try again later.',
    });
  }
});

/**
 * Sends the serialised request body to the Foundry chat completions endpoint
 * and resolves with the assistant message content.
 */
function callFoundryEndpoint(
  endpoint: string,
  apiKey: string,
  body: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL('/v1/chat/completions', endpoint);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const request = transport.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const content: string =
            parsed?.choices?.[0]?.message?.content ?? '';
          if (!content) {
            reject(new Error('Empty response from AI service'));
          } else {
            resolve(content);
          }
        } catch {
          reject(new Error('Failed to parse AI service response'));
        }
      });
    });

    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

export default router;
