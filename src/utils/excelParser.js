const Loan = require('../models/loan');

exports.calculateCreditScore = async (customer) => {
  const loans = await Loan.findAll({
    where: { customer_id: customer.customer_id },
    order: [['start_date', 'DESC']],
  });

  let creditScore = 100;
  const currentYear = new Date().getFullYear();
  let loansTakenThisYear = 0;
  let loansPaidOnTime = 0;
  let loanVolume = 0;

  for (const loan of loans) {
    const startYear = loan.start_date.getFullYear();

    if (startYear === currentYear) {
      loansTakenThisYear++;
    }

    if (loan.emis_paid_on_time === loan.tenure) {
      loansPaidOnTime++;
    }

    loanVolume += loan.loan_amount;
  }

  const currentDebt = await Loan.sum('loan_amount', { where: { customer_id: customer.customer_id, end_date: null } });

  if (currentDebt > customer.approved_limit) {
    creditScore = 0;
  } else {
    creditScore -= (loans.length - loansPaidOnTime) * 10;
    creditScore -= loansTakenThisYear * 5;
    creditScore -= (loanVolume / customer.approved_limit) * 20;
  }

  return Math.max(0, Math.floor(creditScore));
};

exports.calculateMonthlyInstallment = (principal, interest_rate, tenure) => {
  const r = interest_rate / (12 * 100);
  const emi = (principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
  return emi;
};