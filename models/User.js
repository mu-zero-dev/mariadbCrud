const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
});

User.sync()
  .then(() => {
    console.log('User model synced');
  })
  .catch((error) => {
    console.log('Error syncing user model:', error);
  });

module.exports = User;
