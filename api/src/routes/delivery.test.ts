import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import deliveryRouter, { resetDeliveries } from './delivery';
import { deliveries as seedDeliveries } from '../seedData';

let app: express.Express;

describe('Delivery API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/deliveries', deliveryRouter);
        resetDeliveries();
    });

    it('should create a new delivery', async () => {
        const newDelivery = {
            deliveryId: 99,
            supplierId: 1,
            deliveryDate: '2024-06-01T00:00:00.000Z',
            name: 'Test Delivery',
            description: 'A test delivery',
            status: 'pending'
        };
        const response = await request(app).post('/deliveries').send(newDelivery);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newDelivery);
    });

    it('should get all deliveries', async () => {
        const response = await request(app).get('/deliveries');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(seedDeliveries.length);
        response.body.forEach((delivery: any, index: number) => {
            expect(delivery).toMatchObject({
                deliveryId: seedDeliveries[index].deliveryId,
                supplierId: seedDeliveries[index].supplierId,
                name: seedDeliveries[index].name,
                description: seedDeliveries[index].description,
                status: seedDeliveries[index].status
            });
        });
    });

    it('should get a delivery by ID', async () => {
        const response = await request(app).get('/deliveries/1');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            deliveryId: seedDeliveries[0].deliveryId,
            name: seedDeliveries[0].name,
            status: seedDeliveries[0].status
        });
    });

    it('should update a delivery by ID', async () => {
        const updatedDelivery = {
            ...seedDeliveries[0],
            name: 'Updated Delivery Name',
            status: 'in-transit'
        };
        const response = await request(app).put('/deliveries/1').send(updatedDelivery);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            deliveryId: seedDeliveries[0].deliveryId,
            name: 'Updated Delivery Name',
            status: 'in-transit'
        });
    });

    it('should update delivery status by ID', async () => {
        const response = await request(app)
            .put('/deliveries/1/status')
            .send({ status: 'delivered' });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            deliveryId: seedDeliveries[0].deliveryId,
            status: 'delivered'
        });
    });

    it('should delete a delivery by ID', async () => {
        const response = await request(app).delete('/deliveries/1');
        expect(response.status).toBe(204);
    });

    it('should return 404 for a non-existing delivery', async () => {
        const response = await request(app).get('/deliveries/999');
        expect(response.status).toBe(404);
    });

    it('should return 404 when updating a non-existing delivery', async () => {
        const response = await request(app).put('/deliveries/999').send({ name: 'Ghost Delivery' });
        expect(response.status).toBe(404);
    });

    it('should return 404 when updating status of a non-existing delivery', async () => {
        const response = await request(app)
            .put('/deliveries/999/status')
            .send({ status: 'delivered' });
        expect(response.status).toBe(404);
    });

    it('should return 404 when deleting a non-existing delivery', async () => {
        const response = await request(app).delete('/deliveries/999');
        expect(response.status).toBe(404);
    });
});
