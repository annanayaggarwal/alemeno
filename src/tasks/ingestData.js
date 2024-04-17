const xlsx = require('xlsx');
const Customer = require('../models/customer');
const Loan = require('../models/loan');

const ingestCustomerData = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet);

  for (const row of data) {
    await Customer.create({
      customer_id: row.customer_id,
      first_name: row.first_name,
      last_name: row.last_name,
      phone_number: row.phone_number,
      monthly_salary: row.monthly_salary,
      approved_limit: row.approved_limit,
      current_debt: row.current_debt,
    });
  }
};

const ingestLoanData = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet);

  for (const row of data) {
    const startDate = new Date(row.start_date);
    const endDate = new Date(row.end_date);

    await Loan.create({
      customer_id: row.customer_id,
      loan_id: row.loan_id,
      loan_amount: row.loan_amount,
      tenure: row.tenure,
      interest_rate: row.interest_rate,
      monthly_repayment: row.monthly_repayment,
      emis_paid_on_time: row.emis_paid_on_time,
      start_date: startDate,
      end_date: endDate,
    });
  }
};

exports.ingestData = async () => {
  await ingestCustomerData('customer_data.xlsx');
  await ingestLoanData('loan_data.xlsx');
};