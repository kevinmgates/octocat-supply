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
const branch_1 = __importStar(require("./branch"));
const seedData_1 = require("../seedData");
let app;
(0, vitest_1.describe)('Branch API', () => {
    (0, vitest_1.beforeEach)(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/branches', branch_1.default);
        (0, branch_1.resetBranches)();
    });
    (0, vitest_1.it)('should create a new branch', () => __awaiter(void 0, void 0, void 0, function* () {
        const newBranch = {
            branchId: 3,
            headquartersId: 1,
            name: "Eastside Branch",
            description: "Eastern district branch",
            address: "321 East St",
            contactPerson: "Emma Davis",
            email: "edavis@octo.com",
            phone: "555-0203"
        };
        const response = yield (0, supertest_1.default)(app).post('/branches').send(newBranch);
        (0, vitest_1.expect)(response.status).toBe(201);
        (0, vitest_1.expect)(response.body).toEqual(newBranch);
    }));
    (0, vitest_1.it)('should get all branches', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/branches');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.length).toBe(seedData_1.branches.length);
        response.body.forEach((branch, index) => {
            (0, vitest_1.expect)(branch).toMatchObject(seedData_1.branches[index]);
        });
    }));
    (0, vitest_1.it)('should get a branch by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/branches/1');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toEqual(seedData_1.branches[0]);
    }));
    (0, vitest_1.it)('should update a branch by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedBranch = Object.assign(Object.assign({}, seedData_1.branches[0]), { name: 'Updated Downtown Branch' });
        const response = yield (0, supertest_1.default)(app).put('/branches/1').send(updatedBranch);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toEqual(updatedBranch);
    }));
    (0, vitest_1.it)('should delete a branch by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete('/branches/1');
        (0, vitest_1.expect)(response.status).toBe(204);
    }));
    (0, vitest_1.it)('should return 404 for non-existing branch', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/branches/999');
        (0, vitest_1.expect)(response.status).toBe(404);
    }));
});
