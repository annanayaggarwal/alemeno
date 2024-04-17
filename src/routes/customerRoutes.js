const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customercontroller');

// POST /api/customers/register
router.post('/register', customerController.registerCustomer);

module.exports = router;
