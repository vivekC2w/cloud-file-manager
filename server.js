const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

require('./cron/cronJobs');

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

module.exports = server;