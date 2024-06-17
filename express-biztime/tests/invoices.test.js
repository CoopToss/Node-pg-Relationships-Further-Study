const request = require('supertest');
const app = require('../app');
const client = require('../db');

beforeAll(async () => {
    await client.query('DELETE FROM invoices');
    await client.query('DELETE FROM companies');
    await client.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)', ['apple', 'Apple', 'Maker of iPhones']);
    await client.query('INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, $4, $5, $6)', [1, 'apple', 100, false, '2023-01-01', null]);
});

afterAll(async () => {
    await client.end();
});

describe('GET /invoices', () => {
    test('Get list of invoices', async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoices: [{ id: 1, comp_code: 'apple' }]
        });
    });
});

describe('PUT /invoices/:id', () => {
    test('Update an invoice', async () => {
        const res = await request(app)
            .put('/invoices/1')
            .send({ amt: 200, paid: true });
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.amt).toBe(200);
        expect(res.body.invoice.paid).toBe(true);
        expect(res.body.invoice.paid_date).not.toBeNull();
    });
});
