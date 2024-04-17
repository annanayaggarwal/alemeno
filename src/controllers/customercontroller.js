const { validationResult } = require('express-validator');
const Customer = require('../models/customer');
const { calculateApprovedLimit } = require('../utils/helpers');

exports.registerCustomer = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create new customer
    const newCustomer = await Customer.create(req.body);

    // Calculate approved limit
    const approvedLimit = calculateApprovedLimit(req.body.monthly_income);

    // Update approved limit for the customer
    newCustomer.approved_limit = approvedLimit;
    await newCustomer.save();

    res.status(201).json({
      message: 'Customer registered successfully',
      customer: newCustomer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
