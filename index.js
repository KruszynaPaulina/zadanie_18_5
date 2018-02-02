const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const UsersService = require('./UserService');

const userService = new UsersService();

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.send(__dirname + '/index.html')
});

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        userService.addUser({
            id: socket.id,
            name
        });

        io.emit('update', {
            users: userService.getAllUsers()
        });
    });
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        userService.removeUser(socket.id);
        socket.broadcast.emit('update', {
            users: userService.getAllUsers()
        });
    });
});

io.on('connection', socket => {
    socket.on('message', message => {
        const {name} = userService.getUserById(socket.id);
        socket.broadcast.emit('message', {
            message: message.text,
            from: name
        });
    });
});

server.listen(3000, () => {
    console.log('listing on*:3000');
});