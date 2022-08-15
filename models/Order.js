const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Order = db.define('order',
    {
        title: { type: Sequelize.STRING },
        specialrequest: { type: Sequelize.STRING(2000) },
        language: { type: Sequelize.STRING },
        quantity: { type: Sequelize.STRING },
        modeofdelivery: { type: Sequelize.STRING },
        dateDelivery: { type: Sequelize.DATE },
    });

module.exports = Order;