const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {
    makeCode,
    shuffle
    } = require('./utils/generator.js');
const {
    userJoin,
    getRoomUsers,
    getUserById,
    userLeave
    } = require('./utils/users.js');
const {
    addRoom,
    isValidRoom,
    getChecked,
    setChecked,
    getCards,
    setCards,
    removeRoom
    } = require('./utils/rooms.js');

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
            if (io.sockets.adapter.rooms[room] && io.sockets.adapter.rooms[room].length >= 52) {
                socket.emit('maxPlayersReached');
            }
            else {
                if (!io.sockets.adapter.rooms[room]) {
                    userJoin(socket.id, name, room);
                    socket.join(room);
                }
                socket.emit('roomCreated', room); //Misnomer - actually joins room here
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
            users: getRoomUsers(code),
            checked: getChecked(code)
        })
    });

    socket.on('startGame', (data) => {
        let code = data.code;
        let reshuffle = data.reshuffle;
        if (getChecked(code)) {
            startMobileGame(code, reshuffle);
        }
        else {
            startOnlineGame(code, reshuffle);
        }
    });

    function startMobileGame(code, reshuffle) {
        let users = getRoomUsers(code);
        let cards = shuffle(users.length);
        var action = reshuffle === 1 ? 'dealCard' : 'newCard';
        for (let i = 0; i < users.length; i++) {
            io.to(users[i].id).emit(action, cards[i]);
        }
    }

    function startOnlineGame(code, reshuffle) {
        let users = getRoomUsers(code);
        let cards = shuffle(users.length);
        setCards(code, cards);
        io.to(code).emit('requestInit', code);
    }

    socket.on('requestCards', code => {
        let users = getRoomUsers(code);
        let cards = getCards(code);
        let currUser = users.findIndex(user => user.id === socket.id);
        if (currUser !== -1) {
            cards[currUser] = "RED_BACK.svg";
        }
        socket.emit('sendCards', cards);
    });

    socket.on('mobileCheck', (checked) => {
        let room = Object.keys(socket.rooms)[1];
        if (room) {
            setChecked(room, checked);
            io.to(room).emit('checkChanged', checked);
        }
    });

    socket.on('revealCard', () => {
        let currUser = getUserById(socket.id);
        let users = getRoomUsers(currUser.room);
        let cards = getCards(currUser.room);
        const index = users.findIndex(user => user.id === currUser.id);
        if (index !== -1) {
            socket.emit('revealToUser', cards[index]);
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
               setTimeout(function(){
                   users = getRoomUsers(user.room);
                   if (users.length === 0) {
                       setTimeout(function() { // Do setTimeout twice so you have to be really unlucky for room to die
                           console.log('Time passed, deleting room ' + user.room);
                           removeRoom(user.room);
                       }, 5000);
                   }
               }, 5000); // Remove empty rooms after 10 seconds
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