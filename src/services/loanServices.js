const Customer = require('../models/customer');
const Loan = require('../models/loan');
const { calculateCreditScore, calculateMonthlyInstallment } = require('../utils/excelParser');

exports.registerCustomer = async (first_name, last_name, age, monthly_income, phone_number) => {
  const approved_limit = Math.round(36 * monthly_income / 100000) * 100000;
  const customer = await Customer.create({
    first_name,
    last_name,
    age,
    monthly_salary: monthly_income,
    phone_number,
    approved_limit,
  });

  return {
    customer_id: customer.customer_id,
    name: `${customer.first_name} ${customer.last_name}`,
    age: customer.age,
    monthly_income: customer.monthly_salary,
    approved_limit: customer.approved_limit,
    phone_number: customer.phone_number,
  };
};

exports.checkEligibility = async (customer_id, loan_amount, interest_rate, tenure) => {
  const customer = await Customer.findByPk(customer_id);

  if (!customer) {
    throw new Error('Customer not found');
  }

  const creditScore = calculateCreditScore(customer);
  let corrected_interest_rate = interest_rate;

  if (creditScore > 50) {
    // Approve loan
  } else if (creditScore > 30 && creditScore <= 50) {
    corrected_interest_rate = Math.max(corrected_interest_rate, 12);
  } else if (creditScore > 10 && creditScore <= 30) {
    corrected_interest_rate = Math.max(corrected_interest_rate, 16);
  } else {
    return {
      customer_id,
      approval: false,
      interest_rate: corrected_interest_rate,
      corrected_interest_rate,
      tenure,
      monthly_installment: 0,
    };
  }

  const monthlyInstallment = calculateMonthlyInstallment(loan_amount, corrected_interest_rate, tenure);
  const currentDebt = await Loan.sum('loan_amount', { where: { customer_id, end_date: null } });
  const totalDebt = currentDebt + loan_amount;

  if (totalDebt > customer.approved_limit || monthlyInstallment > 0.5 * customer.monthly_salary) {
    return {
      customer_id,
      approval: false,
      interest_rate: corrected_interest_rate,
      corrected_interest_rate,
      tenure,
      monthly_installment: 0,
    };
  }

  return {
    customer_id,
    approval: true,
    interest_rate: corrected_interest_rate,
    corrected_interest_rate,
    tenure,
    monthly_installment: monthlyInstallment,
  };
};

exports.createLoan = async (customer_id, loan_amount, interest_rate, tenure) => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + tenure);

  const loan = await Loan.create({
    customer_id,
    loan_amount,
    tenure,
    interest_rate,
    monthly_repayment: calculateMonthlyInstallment(loan_amount, interest_rate, tenure),
    start_date: startDate,
    end_date: endDate,
  });

  return {
    loan_id: loan.loan_id,
    customer_id: loan.customer_id,
    loan_approved: true,
    monthly_installment: loan.monthly_repayment,
  };
};

exports.viewLoan = async (loan_id) => {
  const loan = await Loan.findByPk(loan_id, {
    include: {
      model: Customer,
      attributes: ['customer_id', 'first_name', 'last_name', 'phone_number', 'age'],
    },
  });

  if (!loan) {
    return null;
  }

  const customer = loan.Customer;

  return {
    loan_id: loan.loan_id,
    customer: {
      customer_id: customer.customer_id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone_number: customer.phone_number,
      age: customer.age,
    },
    loan_amount: loan.loan_amount,
    interest_rate: loan.interest_rate,
    monthly_installment: loan.monthly_repayment,
    tenure: loan.tenure,
  };
};

exports.makePayment = async (customer_id, loan_id, amount) => {
  const loan = await Loan.findOne({
    where: { customer_id, loan_id },
  });

  if (!loan) {
    return null;
  }

  const remainingAmount = loan.loan_amount - (loan.emis_paid_on_time * loan.monthly_repayment);
  const payment = Math.min(amount, remainingAmount);
  const emis_paid_on_time = loan.emis_paid_on_time + Math.floor(payment / loan.monthly_repayment);

  await loan.update({
    emis_paid_on_time,
  });

  return {
    loan_id: loan.loan_id,
    amount_paid: payment,
    remaining_amount: remainingAmount - payment,
    emis_paid_on_time,
  };
};

exports.viewStatement = async (customer_id, loan_id) => {
    const loan = await Loan.findOne({
      where: { customer_id, loan_id },
    });
  
    if (!loan) {
      return null;
    }
  
    const principal = loan.loan_amount;
    const interest_rate = loan.interest_rate;
    const amount_paid = loan.emis_paid_on_time * loan.monthly_repayment;
    const monthly_installment = loan.monthly_repayment;
    const repayments_left = Math.ceil((principal - amount_paid) / monthly_installment);
  
    return {
      customer_id,
      loan_id,
      principal,
      interest_rate,
      amount_paid,
      monthly_installment,
      repayments_left,
    };
  };