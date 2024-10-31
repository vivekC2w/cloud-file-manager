const Folder = require('../models/folderModal');
const File = require('../models/fileModel');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { PutObjectCommand, GetObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3 } = require('../config/config');

// Create folder
const createFolder = async (req, res) => {
    try {
        const { folderName, parentFolderId } = req.body;
        const newFolder = new Folder({
            folderName,
            uploadedBy: req.user._id,
            parentFolder: parentFolderId || null,
        });

        await newFolder.save();

        const s3FolderKey = `${folderName}`;
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: s3FolderKey,
            Body: '',
        };
        const command = new PutObjectCommand(params);
        io.emit('folderUploadComplete', { message: 'File uploaded successfully!' });
        await s3.send(command);

        res.status(201).json({ message: 'Folder created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create folder' });
    }
};

//Get folder Contents
const getFolderContents = async (req, res) => {
    try {
        const folderId = req.params.id;
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const files = await File.find({ folder: folderId });
        const subFolders = await Folder.find({ parentFolder: folderId });

        res.status(200).json({ folder, files, subFolders });
    } catch (err) {
        console.error('Error fetching folder contents:', err);
        res.status(500).json({ error: 'Failed to get folder contents' });
    }
};

//Download Folder as a zip
const downloadFolderAsZip = async (req, res) => {
    try {
        const folderId = req.params.id;
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const files = await File.find({ folder: folderId });

        // Ensure 'temp' directory exists
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const zipPath = path.join(tempDir, `${folderId}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            res.download(zipPath);
        });

        archive.on('error', (err) => {
            console.error('Archive error:', err);
            throw err;
        });

        output.on('error', (err) => {
            console.error('Output stream error:', err);
            throw err;
        });

        archive.pipe(output);

        for (const file of files) {
            try {
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: file.fileData.split('/').pop(),
                };
                const command = new GetObjectCommand(params);
                const readStream = await s3.send(command);
                archive.append(readStream.Body, { name: file.fileName });
            } catch (err) {
                console.error(`Error appending file ${file.fileName}:`, err);
            }
        }

        await archive.finalize();
    } catch (err) {
        console.error('Error downloading folder as zip:', err);
        res.status(500).json({ error: 'Failed to download folder as zip' });
    }
};

//Delete folder and its contents
const deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.id;

        // Find the folder in MongoDB
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderPrefix = folder.folderName; 

        const listParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: folderPrefix, 
        };

        const listedObjects = await s3.send(new ListObjectsV2Command(listParams));

        const deleteKeys = listedObjects.Contents.map(object => ({ Key: object.Key }));

        // Delete files from S3 if any exist
        if (deleteKeys.length > 0) {
            const deleteParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Delete: {
                    Objects: deleteKeys,
                },
            };
            const deleteCommand = new DeleteObjectsCommand(deleteParams);
            await s3.send(deleteCommand);
        }

        // Delete files from MongoDB
        await File.deleteMany({ folder: folderId });

        // Delete subfolders
        await Folder.deleteMany({ parentFolder: folderId });

        // Delete the main folder from MongoDB
        await folder.deleteOne();

        res.status(200).json({ message: 'Folder and contents deleted successfully' });
    } catch (err) {
        console.error('Error deleting folder:', err);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
};


module.exports = {
    createFolder,
    getFolderContents,
    downloadFolderAsZip,
    deleteFolder,
};