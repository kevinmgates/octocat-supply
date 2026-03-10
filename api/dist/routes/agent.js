"use strict";
/**
 * @swagger
 * tags:
 *   name: Agent
 *   description: AI customer service agent powered by Azure AI Foundry
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const router = express_1.default.Router();
/**
 * POST /api/agent/chat
 * Proxies the user prompt to the configured Azure AI Foundry endpoint and
 * returns the assistant reply. Falls back to a safe error message when the
 * upstream service is unavailable or misconfigured.
 */
router.post('/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, history = [] } = req.body;
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
    const systemPrompt = {
        role: 'system',
        content: 'You are a helpful customer service assistant for OctoCAT Supply, a smart cat technology company. ' +
            'You help customers with product questions, order status inquiries, and general support. ' +
            'Keep responses concise and friendly.',
    };
    const messages = [
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
        const reply = yield callFoundryEndpoint(foundryEndpoint, foundryApiKey, requestBody);
        res.json({ reply });
    }
    catch (err) {
        console.error('Agent chat error:', err);
        res.status(500).json({
            error: 'The AI service is temporarily unavailable. Please try again later.',
        });
    }
}));
/**
 * Sends the serialised request body to the Foundry chat completions endpoint
 * and resolves with the assistant message content.
 */
function callFoundryEndpoint(endpoint, apiKey, body) {
    return new Promise((resolve, reject) => {
        const url = new URL('/v1/chat/completions', endpoint);
        const isHttps = url.protocol === 'https:';
        const transport = isHttps ? https_1.default : http_1.default;
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
                var _a, _b, _c, _d;
                try {
                    const parsed = JSON.parse(data);
                    const content = (_d = (_c = (_b = (_a = parsed === null || parsed === void 0 ? void 0 : parsed.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : '';
                    if (!content) {
                        reject(new Error('Empty response from AI service'));
                    }
                    else {
                        resolve(content);
                    }
                }
                catch (_e) {
                    reject(new Error('Failed to parse AI service response'));
                }
            });
        });
        request.on('error', reject);
        request.write(body);
        request.end();
    });
}
exports.default = router;
