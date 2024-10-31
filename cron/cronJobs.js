const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, '../temp'); 

// Schedule a task to run every hour
cron.schedule('0 * * * *', () => {
    
    fs.readdir(tempDir, (err, files) => {
        if (err) {
            console.error('Error reading temp directory:', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(tempDir, file);

            // Checking if the file is older than 1 hour 
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                const now = Date.now();
                if (now - stats.mtimeMs > 3600000) { 
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting file:', err);
                        } else {
                            console.log(`Deleted old temp file: ${file}`);
                        }
                    });
                }
            });
        });
    });
});

module.exports = cron;
