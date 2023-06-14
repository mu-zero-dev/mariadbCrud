const Sequelize = require('sequelize');

const sequelize = new Sequelize('testdatabase', 'root', '2562', {
    host: 'localhost',
    dialect: 'mariadb'
  });

module.exports = sequelize;

  