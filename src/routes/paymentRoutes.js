const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentcontroller');

// POST /api/payments/make-payment/:loan_id
router.post('/make-payment/:loan_id', paymentController.makePayment);

// GET /api/payments/view-statement/:loan_id
router.get('/view-statement/:loan_id', paymentController.viewStatement);

module.exports = router;
