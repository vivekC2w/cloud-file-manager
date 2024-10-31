const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Route to create a new folder
router.post('/create', authenticateUser, folderController.createFolder);

// Route to get contents of a specific folder
router.get('/contents/:id', authenticateUser, folderController.getFolderContents);

// Route to download a folder as a zip file
router.get('/download-folder/:id', authenticateUser, folderController.downloadFolderAsZip);

// Route to delete a specific folder and its contents
router.delete('/delete/:id', authenticateUser, folderController.deleteFolder);

module.exports = router;
