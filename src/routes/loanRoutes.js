const express = require('express');
const router = express.Router();
const customerController = require('../controllers/loancontroller');

// POST /api/customers/create-loan
router.post('/create-loan', customerController.createLoan);

// GET /api/customers/view-loan/:loan_id
router.get('/view-loan/:loan_id', customerController.viewLoan);

// POST /api/customers/make-payment/:customer_id/:loan_id
router.post('/make-payment/:customer_id/:loan_id', customerController.makePayment);

// GET /api/customers/view-statement/:customer_id/:loan_id
router.get('/view-statement/:customer_id/:loan_id', customerController.viewStatement);

module.exports = router;
