const express = require('express');
const router = express.Router();
const moment = require('moment');
const Order = require('../models/Order');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const fs = require('fs');
const upload = require('../helpers/imageUpload');

router.get('/OrderDatabase', ensureAuthenticated, (req, res) => {
    Order.findAll({
        where: { userId: req.user.id },
        order: [['dateDelivery', 'DESC']],
        raw: true
    })
        .then((orders) => {
            res.render('order/OrderDatabase', { orders });
        })
        .catch(err => console.log(err));
});

router.get('/addVideo', ensureAuthenticated, (req, res) => {
    res.render('order/addVideo');
});

router.post('/addVideo', ensureAuthenticated, (req, res) => {
    let title = req.body.title;
    let specialrequest = req.body.specialrequest.slice(0, 1999);
    let dateDelivery = moment(req.body.dateDelivery, 'DD/MM/YYYY');
    let language = req.body.language.toString();
    // Multi-value components return array of strings or undefined
    let quantity = req.body.quantity === undefined ? '' : req.body.quantity.toString();
    let modeofdelivery = req.body.modeofdelivery;
    let userId = req.user.id;

    Order.create(
        { title, specialrequest, modeofdelivery, language, quantity, dateDelivery, userId }
    )
        .then((order) => {
            console.log(order.toJSON());
            res.redirect('/order/OrderDatabase');
        })
        .catch(err => console.log(err))
});


router.get('/editadminOrder/:id', ensureAuthenticated, (req, res) => {
    Order.findByPk(req.params.id)
        .then((order) => {
            if (!order) {
                flashMessage(res, 'error', 'Orders not found');
                res.redirect('/order/OrderDatabase');
                return;
            }
            if (req.user.id != order.userId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/order/OrderDatabase');
                return;
            }
            res.render('order/OrderDatabase', { order });
        })
        .catch(err => console.log(err));
});

router.post('/editadminOrder/:id', ensureAuthenticated, (req, res) => {
    let title = req.body.title;
    let specialrequest = req.body.specialrequest.slice(0, 1999);
    let dateDelivery = moment(req.body.dateDelivery, 'DD/MM/YYYY');
    let language = req.body.language.toString();
    let quantity = req.body.quantity === undefined ? '' : req.body.quantity.toString();
    let modeofdelivery = req.body.modeofdelivery;

    Order.update(
        { title, specialrequest, modeofdelivery, language, quantity, dateDelivery },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' Order updated');
            res.redirect('/order/OrderDatabase');
        })
        .catch(err => console.log(err));
});

router.get('/deleteadminOrder/:id', ensureAuthenticated, async function
    (req, res) {
    try {
        let order = await Order.findByPk(req.params.id);
        if (!order) {
            flashMessage(res, 'error', 'Order not found');
            res.redirect('/order/OrderDatabase');
            return;
        }
        if (req.user.id != order.userId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/order/OrderDatabase');
            return;
        }
        let result = await Order.destroy({ where: { id: order.id } });
        console.log(result + ' Order deleted');
        res.redirect('/order/OrderDatabase');
    }
    catch (err) {
        console.log(err);
    }
});

