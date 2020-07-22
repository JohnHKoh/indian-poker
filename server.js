const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {makeCode, shuffle} = require('./utils/generator.js');
const {userJoin, getRoomUsers, getUserById, userLeave} = require('./utils/users.js');
const {addRoom, isValidRoom} = require('./utils/rooms.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'pages/public')));

app.get('/game', (req, res) => {
    if (!req.query.code) {
        res.redirect('join.html?code=game'); // Literally so hacky
    }
    else if (!req.query.name) {
        res.redirect('join.html?code=' + req.query.code);
    }
    else {
        res.sendFile(path.join(__dirname, 'pages/game.html'));
    }
});

app.get('/:id', (req, res) => {
    res.redirect('join.html?code=' + req.params.id);
});

app.all('*', (req, res) => {
    res.redirect('/');
});

io.on('connection', socket => {
    socket.on('newGame', () => {
        const code = makeCode(4);
        addRoom(code);
        socket.emit('roomCreated', code);
    });
    socket.on('joinGame', ({name, room}) => {
        room = room.toUpperCase();
        if (isValidRoom(room)) {
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
        if (!isValidRoom(code)) {
            socket.emit('noSuchRoom');
            return;
        }
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
           let users = getRoomUsers(user.room);
           if (users.length === 0) {

           }
           io.to(user.room).emit('roomUsers', {
               room: user.room,
               users: users
           });
       }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));