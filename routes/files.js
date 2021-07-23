const express = require('express');
const router = express.Router();
const filesController = require('../controllers/files')

router.post('/', filesController.postUploadFiles)
router.post('/send', filesController.sendEmail)
// router.post('/delete', filesController.delete)

module.exports = router;