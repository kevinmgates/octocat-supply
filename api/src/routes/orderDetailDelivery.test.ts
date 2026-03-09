import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderDetailDeliveryRouter, { resetOrderDetailDeliveries } from './orderDetailDelivery';
import { orderDetailDeliveries as seedOrderDetailDeliveries } from '../seedData';

let app: express.Express;

describe('Order Detail Delivery API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/order-detail-deliveries', orderDetailDeliveryRouter);
        resetOrderDetailDeliveries();
    });

    it('should create a new order detail delivery', async () => {
        const newODD = {
            orderDetailDeliveryId: 99,
            orderDetailId: 1,
            deliveryId: 99,
            quantity: 5,
            notes: 'Test delivery batch'
        };
        const response = await request(app).post('/order-detail-deliveries').send(newODD);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newODD);
    });

    it('should get all order detail deliveries', async () => {
        const response = await request(app).get('/order-detail-deliveries');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(seedOrderDetailDeliveries.length);
        response.body.forEach((odd: any, index: number) => {
            expect(odd).toMatchObject(seedOrderDetailDeliveries[index]);
        });
    });

    it('should get an order detail delivery by delivery ID', async () => {
        const response = await request(app).get('/order-detail-deliveries/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(seedOrderDetailDeliveries[0]);
    });

    it('should update an order detail delivery by delivery ID', async () => {
        const updatedODD = {
            ...seedOrderDetailDeliveries[0],
            quantity: 10,
            notes: 'Updated delivery batch'
        };
        const response = await request(app).put('/order-detail-deliveries/1').send(updatedODD);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedODD);
    });

    it('should delete an order detail delivery by delivery ID', async () => {
        const response = await request(app).delete('/order-detail-deliveries/1');
        expect(response.status).toBe(204);
    });

    it('should return 404 for a non-existing order detail delivery', async () => {
        const response = await request(app).get('/order-detail-deliveries/999');
        expect(response.status).toBe(404);
    });

    it('should return 404 when updating a non-existing order detail delivery', async () => {
        const response = await request(app)
            .put('/order-detail-deliveries/999')
            .send({ quantity: 5 });
        expect(response.status).toBe(404);
    });

    it('should return 404 when deleting a non-existing order detail delivery', async () => {
        const response = await request(app).delete('/order-detail-deliveries/999');
        expect(response.status).toBe(404);
    });
});
