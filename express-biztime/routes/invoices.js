const express = require('express');
const router = new express.Router();
const client = require('../db');

// GET /invoices
router.get('/', async (req, res, next) => {
    try {
        const result = await client.query('SELECT id, comp_code FROM invoices');
        return res.json({ invoices: result.rows });
    } catch (err) {
        return next(err);
    }
});

// GET /invoices/[id]
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const invoiceResult = await client.query('SELECT * FROM invoices WHERE id = $1', [id]);
        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        const invoice = invoiceResult.rows[0];
        const companyResult = await client.query('SELECT code, name, description FROM companies WHERE code = $1', [invoice.comp_code]);
        invoice.company = companyResult.rows[0];
        return res.json({ invoice });
    } catch (err) {
        return next(err);
    }
});

// POST /invoices
router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await client.query(
            'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [comp_code, amt]
        );
        return res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// PUT /invoices/[id]
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;
        let paidDate = null;

        if (paid) {
            paidDate = new Date();
        }

        const result = await client.query(
            'UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [amt, paid, paidDate, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        return res.json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});
// DELETE /invoices/[id]
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await client.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        return res.json({ status: 'deleted' });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
