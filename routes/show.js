const express = require('express');
const router = express.Router();
const showController = require('../controllers/show')

router.get('/:uuid', showController.getFile)

module.exports = router;