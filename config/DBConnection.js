const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Order = require('../models/Order');

// If drop is true, all existing tables are dropped and recreated 
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            User.hasMany(Order);
            Order.belongsTo(User);
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};

module.exports = { setUpDB };