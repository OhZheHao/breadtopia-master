const express = require('express');
const router = express.Router();

router.get('/admin', function (req, res, next) {
    res.render('/admin', 
    );
  });
