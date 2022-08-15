const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Product = db.define('product',
    {
        // title: { type: Sequelize.STRING },
        // story: { type: Sequelize.STRING(2000) },
        // language: { type: Sequelize.STRING },
        // subtitles: { type: Sequelize.STRING },
        // classification: { type: Sequelize.STRING },
        item: { type: Sequelize.STRING},
        description: { type: sequelize.STRING(2000)},
        price: {type: sequelize.DECIMAL},
        dateRelease: { type: Sequelize.DATE },
        posterURL: { type: Sequelize.STRING },
        quantity: { type: Sequelize.INTEGER},

    });
module.exports = Product;