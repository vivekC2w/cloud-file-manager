// Helper function to format file size
const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes >= 1e9) {
        return `${(sizeInBytes / 1e9).toFixed(2)} GB`;
    } else if (sizeInBytes >= 1e6) {
        return `${(sizeInBytes / 1e6).toFixed(2)} MB`;
    } else if (sizeInBytes >= 1e3) {
        return `${(sizeInBytes / 1e3).toFixed(2)} KB`;
    }
    return `${sizeInBytes} Bytes`;
};

module.exports = { formatFileSize };