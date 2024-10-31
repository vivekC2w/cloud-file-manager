const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Route to upload a file
router.post('/upload', authenticateUser, fileController.upload.single('file'), fileController.uploadFile);

// Route to download a specific file
router.get('/download/:id', authenticateUser, fileController.downloadFile);

// Route to delete a specific file
router.delete('/delete/:id', authenticateUser, fileController.deleteFile);

module.exports = router;
