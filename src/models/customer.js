const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  monthly_income: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  approved_limit: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = Customer;
