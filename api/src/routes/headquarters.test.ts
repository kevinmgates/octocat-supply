import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import headquartersRouter, { resetHeadquarters } from './headquarters';
import { headquarters as seedHeadquarters } from '../seedData';

let app: express.Express;

describe('Headquarters API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/headquarters', headquartersRouter);
        resetHeadquarters();
    });

    it('should create a new headquarters', async () => {
        const newHQ = {
            headquartersId: 99,
            name: 'New Test HQ',
            description: 'A test headquarters',
            address: '99 Test Lane',
            contactPerson: 'Test Contact',
            email: 'test@hq.com',
            phone: '555-9999'
        };
        const response = await request(app).post('/headquarters').send(newHQ);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newHQ);
    });

    it('should get all headquarters', async () => {
        const response = await request(app).get('/headquarters');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(seedHeadquarters.length);
        response.body.forEach((hq: any, index: number) => {
            expect(hq).toMatchObject(seedHeadquarters[index]);
        });
    });

    it('should get a headquarters by ID', async () => {
        const response = await request(app).get('/headquarters/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(seedHeadquarters[0]);
    });

    it('should update a headquarters by ID', async () => {
        const updatedHQ = {
            ...seedHeadquarters[0],
            name: 'Updated HQ Name'
        };
        const response = await request(app).put('/headquarters/1').send(updatedHQ);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedHQ);
    });

    it('should delete a headquarters by ID', async () => {
        const response = await request(app).delete('/headquarters/1');
        expect(response.status).toBe(204);
    });

    it('should return 404 for a non-existing headquarters', async () => {
        const response = await request(app).get('/headquarters/999');
        expect(response.status).toBe(404);
    });

    it('should return 404 when updating a non-existing headquarters', async () => {
        const response = await request(app).put('/headquarters/999').send({ name: 'Ghost HQ' });
        expect(response.status).toBe(404);
    });

    it('should return 404 when deleting a non-existing headquarters', async () => {
        const response = await request(app).delete('/headquarters/999');
        expect(response.status).toBe(404);
    });
});
