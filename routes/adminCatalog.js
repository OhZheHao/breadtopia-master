const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require('../models/Products');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
// Required for file upload
const fs = require('fs');
const upload = require('../helpers/imageUpload');

router.get('/listProducts', ensureAuthenticated, (req, res) => {
    Product.findAll({
        where: { userId: req.user.id },
        order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((products) => {

            res.render('adminCatalog/listProducts', { products });
        })
        .catch(err => console.log(err));
});

router.get('/addProducts', ensureAuthenticated, (req, res) => {
    res.render('adminCatalog/addProducts');
});

router.post('/addProducts', ensureAuthenticated, (req, res) => {

    let item = req.body.item;
    let description = req.body.description;
    let price = req.body.price;
    let posterURL = req.body.posterURL;
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let userId = req.user.id;
    let quantity = req.body.quantity;
    Product.create(
        {
            item, description, price,
            dateRelease,
            userId,
            posterURL, quantity
        }
    )
        .then((product) => {
            console.log(product.toJSON());
            res.redirect('/adminCatalog/listProducts');
        })
        .catch(err => console.log(err))
});

router.get('/editProducts/:id', ensureAuthenticated, (req, res) => {
    Product.findByPk(req.params.id)
        .then((product) => {
            if (!product) {
                flashMessage(res, 'error', 'Item not found');
                res.redirect('/adminCatalog/listProducts');
                return;
            }
            if (req.user.id != product.userId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/adminCatalog/listProducts');
                return;
            }
            res.render('adminCatalog/editProducts', { product });
        })
        .catch(err => console.log(err));
});

router.post('/editProducts/:id', ensureAuthenticated, (req, res) => {
    let item = req.body.item;
    let description = req.body.description.slice(0, 1999);
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let price = req.body.price;
    let quantity = req.body.quantity;
    let posterURL = req.body.posterURL;

    Product.update(
        {
            item, description, dateRelease, price, quantity, posterURL
        },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' item updated');
            res.redirect('/adminCatalog/listProducts');
        })
        .catch(err => console.log(err));
});

router.get('/deleteProducts/:id', ensureAuthenticated, async function
    (req, res) {
    try {
        let product = await Product.findByPk(req.params.id);
        if (!product) {
            flashMessage(res, 'error', 'Item not found');
            res.redirect('/adminCatalog/listProducts');
            return;
        }
        if (req.user.id != product.userId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/adminCatalog/listProducts');
            return;
        }
        let result = await Product.destroy({ where: { id: product.id } });
        console.log(result + ' Item deleted');
        res.redirect('/adminCatalog/listProducts');
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