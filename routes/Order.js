const express = require('express');
const router = express.Router();
const moment = require('moment');
const Order = require('../models/Order');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const fs = require('fs');
const upload = require('../helpers/imageUpload');

router.get('/ShoppingCart', ensureAuthenticated, (req, res) => {
    Order.findAll({
        where: { userId: req.user.id },
        order: [['dateDelivery', 'DESC']],
        raw: true
    })
        .then((orders) => {
            res.render('order/ShoppingCart', { orders });
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
            res.redirect('/order/ShoppingCart');
        })
        .catch(err => console.log(err))
});


router.get('/editOrder/:id', ensureAuthenticated, (req, res) => {
    Order.findByPk(req.params.id)
        .then((order) => {
            if (!order) {
                flashMessage(res, 'error', 'Orders not found');
                res.redirect('/order/ShoppingCart');
                return;
            }
            if (req.user.id != order.userId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/order/ShoppingCart');
                return;
            }
            res.render('order/editOrder', { order });
        })
        .catch(err => console.log(err));
});

router.post('/editOrder/:id', ensureAuthenticated, (req, res) => {
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
            res.redirect('/order/ShoppingCart');
        })
        .catch(err => console.log(err));
});

router.get('/deleteOrder/:id', ensureAuthenticated, async function
    (req, res) {
    try {
        let order = await Order.findByPk(req.params.id);
        if (!order) {
            flashMessage(res, 'error', 'Order not found');
            res.redirect('/order/ShoppingCart');
            return;
        }
        if (req.user.id != order.userId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/order/ShoppingCart');
            return;
        }
        let result = await Order.destroy({ where: { id: order.id } });
        console.log(result + ' Order deleted');
        res.redirect('/order/ShoppingCart');
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, {
            recursive:
                true
        });
    }
    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
            res.json({
                file: `/uploads/${req.user.id}/${req.file.filename}`
            });
        }
    });
});

module.exports = router;