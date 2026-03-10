import { describe, it, expect } from 'vitest';
import { api } from './config';

describe('API configuration', () => {
    it('defines all expected endpoint paths', () => {
        expect(api.endpoints.products).toBe('/api/products');
        expect(api.endpoints.suppliers).toBe('/api/suppliers');
        expect(api.endpoints.orders).toBe('/api/orders');
        expect(api.endpoints.branches).toBe('/api/branches');
        expect(api.endpoints.headquarters).toBe('/api/headquarters');
        expect(api.endpoints.deliveries).toBe('/api/deliveries');
        expect(api.endpoints.orderDetails).toBe('/api/order-details');
        expect(api.endpoints.orderDetailDeliveries).toBe('/api/order-detail-deliveries');
    });

    it('exposes a baseURL string', () => {
        expect(typeof api.baseURL).toBe('string');
        expect(api.baseURL.length).toBeGreaterThan(0);
    });

    it('baseURL defaults to localhost:3000 when no runtime config is present', () => {
        // In the test environment there is no window.RUNTIME_CONFIG and no
        // CODESPACE_NAME env variable, so the URL should fall back to localhost.
        expect(api.baseURL).toMatch(/localhost:3000/);
    });
});
