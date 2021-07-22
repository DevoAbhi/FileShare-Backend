const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/download')

router.get('/:uuid', downloadController.downloadFile)

module.exports = router;