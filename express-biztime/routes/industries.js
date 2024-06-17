const express = require('express');
const router = new express.Router();
const client = require('../db');

// GET /industries
router.get('/', async (req, res, next) => {
    try {
        const result = await client.query('SELECT code, industry FROM industries');
        return res.json({ industries: result.rows });
    } catch (err) {
        return next(err);
    }
});

// POST /industries
router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const result = await client.query(
            'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry',
            [code, industry]
        );
        return res.status(201).json({ industry: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// POST /industries/:ind_code/companies/:comp_code
router.post('/:ind_code/companies/:comp_code', async (req, res, next) => {
    try {
        const { ind_code, comp_code } = req.params;
        const result = await client.query(
            'INSERT INTO companies_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code',
            [comp_code, ind_code]
        );
        return res.status(201).json({ association: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
