const request = require('supertest');
const app = require('../app');
const client = require('../db');

beforeAll(async () => {
    await client.query('DELETE FROM companies');
    await client.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)', ['apple', 'Apple', 'Maker of iPhones']);
});

afterAll(async () => {
    await client.end();
});

describe('GET /companies', () => {
    test('Get list of companies', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            companies: [{ code: 'apple', name: 'Apple' }]
        });
    });
});

describe('POST /companies', () => {
    test('Create a new company', async () => {
        const res = await request(app)
            .post('/companies')
            .send({ name: 'Amazon', description: 'Online Retailer' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code: 'amazon', name: 'Amazon', description: 'Online Retailer' }
        });
    });
});
