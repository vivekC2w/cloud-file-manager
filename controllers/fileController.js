const { s3 } = require('../config/config');
const multer = require('multer');
const File = require('../models/fileModel');
const Folder = require('../models/folderModal');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { formatFileSize } = require('../helper/helperFunctions');

// Multer upload configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload file
const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const folderId = req.body.folderId || null;
    
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const bucketName = process.env.S3_BUCKET_NAME;
        if (!bucketName) {
            return res.status(500).json({ error: 'Bucket name is missing in AWS configuration' });
        }

        const fileKey = `${Date.now()}-${file.originalname}`;
        const params = {
            Bucket: bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        //Upload file to s3
        const command = new PutObjectCommand(params);
        const uploadResult = await s3.send(command);

        const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;

        if (folderId) {
            const folder = await Folder.findById(folderId);
            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }
        }

        const formattedFileSize = formatFileSize(file.size);

        const newFile = new File({
            uploadedBy: req.user._id,
            folder: folderId || null,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: formattedFileSize,
            fileData: fileUrl,
        });

        await newFile.save();
        io.emit('fileUploadComplete', { message: 'File uploaded successfully!' });
        return res.status(200).json({ message: 'File uploaded successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to upload file' });
    }
};

//Downloading file
const downloadFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const fileKey = file.fileData.replace('https://myapp-file-storage.s3.amazonaws.com/', '');
        
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
        };
        
        const command = new GetObjectCommand(params);
        io.emit('fileDownloadStarted', { message: 'File download has started.' });
        const response = await s3.send(command);

        const tempDir = path.join(__dirname, '../temp'); 
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir); 
        }

        const tempFilePath = path.join(tempDir, fileKey);

        const writeStream = fs.createWriteStream(tempFilePath);

        response.Body.pipe(writeStream);

        writeStream.on('finish', () => {
            res.download(tempFilePath, (err) => {
                if (err) {
                    console.error("Error sending file:", err);
                    res.status(500).json({ error: 'Failed to send downloaded file' });
                }
            });
        });

        writeStream.on('error', (err) => {
            console.error("Error writing file:", err);
            res.status(500).json({ error: 'Failed to save downloaded file' });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to download file' });
    }
};

//Delete file
const deleteFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.fileData.split('/').pop(),
        };

        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        await file.deleteOne();
        io.emit('fileDeleted', { message: 'File deleted successfully.' });
        return res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ error: 'Failed to delete file' });
    }
};

module.exports = {
    upload,
    uploadFile,
    downloadFile,
    deleteFile,
};