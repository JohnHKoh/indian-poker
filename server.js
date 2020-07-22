const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {makeCode, shuffle} = require('./utils/generator.js');
const {userJoin, getRoomUsers, getUserById, userLeave} = require('./utils/users.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'pages')));

io.on('connection', socket => {
    socket.on('newGame', () => {
        const code = makeCode(4);
        socket.emit('roomCreated', code);
    });
    socket.on('joinGame', ({name, room}) => {
        room = room.toUpperCase();
        if (Object.keys(io.sockets.adapter.rooms).includes(room)) {
            if (io.sockets.adapter.rooms[room].length >= 52) {
                socket.emit('maxPlayersReached');
            }
            else {
                socket.emit('roomCreated', room);
            }
        }
        else {
            socket.emit('noSuchRoom');
        }
    });

    socket.on('joinRoom', ({name, code}) => {
        userJoin(socket.id, name, code);
        socket.join(code);
        io.to(code).emit('roomUsers', {
            room: code,
            users: getRoomUsers(code)
        })
    });

    socket.on('startGame', (data) => {
        let code = data.code;
        let reshuffle = data.reshuffle;
        let users = getRoomUsers(code);
        let cards = shuffle(users.length);
        var action = reshuffle === 1 ? 'dealCard' : 'newCard';
        for (let i = 0; i < users.length; i++) {
            io.to(users[i].id).emit(action, cards[i]);
        }
    });

    socket.on('endGame', (code) => {
       io.to(code).emit('returnToLobby');
    });

    socket.on('disconnect', () => {
       const user = userLeave(socket.id);
       if (user) {
           io.to(user.room).emit('roomUsers', {
               room: user.room,
               users: getRoomUsers(user.room)
           });
       }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));