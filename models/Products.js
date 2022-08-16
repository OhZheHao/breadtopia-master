const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Product = db.define('product',
    {
        
        item: { type: Sequelize.STRING},
        description: { type: sequelize.STRING(2000)},
        price: {type: sequelize.DECIMAL},
        dateRelease: { type: Sequelize.DATE },
        posterURL: { type: Sequelize.STRING },
        quantity: { type: Sequelize.INTEGER},

    });
module.exports = Product;