const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Products');
// If drop is true, all existing tables are dropped and recreated 
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            User.hasMany(Order);
            Order.belongsTo(User);
            User.hasMany(Product);
            Product.belongsTo(User);
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};

module.exports = { setUpDB };