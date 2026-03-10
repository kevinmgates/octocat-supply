"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
// Helper to set environment variables for tests
const setEnv = (overrides) => {
    for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined) {
            delete process.env[key];
        }
        else {
            process.env[key] = value;
        }
    }
};
(0, vitest_1.describe)('Agent chat API', () => {
    let app;
    (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clear module cache so env vars are re-read in each test
        vitest_1.vi.resetModules();
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        const { default: agentRouter } = yield Promise.resolve().then(() => __importStar(require('./agent')));
        app.use('/agent', agentRouter);
    }));
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
        setEnv({
            AZURE_FOUNDRY_ENDPOINT: undefined,
            AZURE_FOUNDRY_API_KEY: undefined,
            AZURE_FOUNDRY_MODEL: undefined,
        });
    });
    (0, vitest_1.it)('returns 400 when message is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/agent/chat').send({});
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body).toHaveProperty('error');
    }));
    (0, vitest_1.it)('returns 400 when message is an empty string', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/agent/chat')
            .send({ message: '   ' });
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body).toHaveProperty('error');
    }));
    (0, vitest_1.it)('returns 500 when Foundry credentials are not configured', () => __awaiter(void 0, void 0, void 0, function* () {
        setEnv({ AZURE_FOUNDRY_ENDPOINT: undefined, AZURE_FOUNDRY_API_KEY: undefined });
        const response = yield (0, supertest_1.default)(app)
            .post('/agent/chat')
            .send({ message: 'Hello' });
        (0, vitest_1.expect)(response.status).toBe(500);
        (0, vitest_1.expect)(response.body).toHaveProperty('error');
    }));
    (0, vitest_1.it)('returns 500 when only endpoint is set (no key)', () => __awaiter(void 0, void 0, void 0, function* () {
        setEnv({
            AZURE_FOUNDRY_ENDPOINT: 'https://example.openai.azure.com',
            AZURE_FOUNDRY_API_KEY: undefined,
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/agent/chat')
            .send({ message: 'Hello' });
        (0, vitest_1.expect)(response.status).toBe(500);
        (0, vitest_1.expect)(response.body).toHaveProperty('error');
    }));
    (0, vitest_1.it)('returns 500 when upstream AI call fails', () => __awaiter(void 0, void 0, void 0, function* () {
        setEnv({
            AZURE_FOUNDRY_ENDPOINT: 'https://example.openai.azure.com',
            AZURE_FOUNDRY_API_KEY: 'test-key',
        });
        // The endpoint is unreachable in test; expect graceful 500 error handling
        const response = yield (0, supertest_1.default)(app)
            .post('/agent/chat')
            .send({ message: 'Where is my order?' });
        (0, vitest_1.expect)(response.status).toBe(500);
        (0, vitest_1.expect)(response.body).toHaveProperty('error');
    }));
});
