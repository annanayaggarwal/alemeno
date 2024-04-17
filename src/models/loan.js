const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  interest_rate: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tenure: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Loan;
