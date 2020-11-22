const socketio = require('socket.io');
const {
    makeCode,
    shuffle
} = require('../utils/generator.js');
const {
    userJoin,
    getRoomUsers,
    getUserById,
    userLeave
} = require('../utils/users.js');
const {
    addRoom,
    isValidRoom,
    getChecked,
    setChecked,
    getInGame,
    setInGame,
    getCards,
    setCards,
    cardLeave,
    removeRoom
} = require('../utils/rooms.js');
const MAX_PLAYERS = 10;

module.exports.listen = function(server) {
    const io = socketio(server);

    io.on('connection', socket => {
        socket.on('newGame', () => {
            const code = makeCode(4);
            addRoom(code);
            socket.emit('roomCreated', code);
        });
        socket.on('joinGame', ({name, room}) => {
            room = room.toUpperCase();
            if (isValidRoom(room)) {
                var users = getRoomUsers(room);
                if (users && users.length >= MAX_PLAYERS) {
                    socket.emit('maxPlayersReached');
                }
                else if (users && users.findIndex(user => user.username === name) !== -1) {
                    socket.emit('nameInUse');
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
            var users = getRoomUsers(code);
            if (!isValidRoom(code)) {
                socket.emit('noSuchRoom');
                return;
            }
            if (users && users.length >= MAX_PLAYERS) {
                socket.emit('maxPlayersReached');
                return;
            }
            if (users && users.findIndex(user => user.username === name) !== -1) {
                console.log('here');
                socket.emit('nameInUse');
                return;
            }
            userJoin(socket.id, name, code);
            socket.join(code);
            io.to(code).emit('roomUsers', {
                room: code,
                users: getRoomUsers(code),
                checked: getChecked(code),
                inGame: getInGame(code)
            })
        });

        socket.on('startGame', (data) => {
            let code = data.code;
            let reshuffle = data.reshuffle;
            if (getInGame(code) && reshuffle !== 1) {
                socket.emit('gameInProgress');
                return;
            }
            setInGame(code, true);
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

        socket.on('verifyUser', name => {
            let currUser = getUserById(socket.id);
            socket.emit('sendVerification', currUser.username === name);
        });

        socket.on('guessChanged', ({id, option}) => {
            let currUser = getUserById(socket.id);
            io.to(currUser.room).emit('changeGuess', {id, option});
        });

        socket.on('revealCard', () => {
            let currUser = getUserById(socket.id);
            let users = getRoomUsers(currUser.room);
            let cards = getCards(currUser.room);
            const index = users.findIndex(user => user.id === currUser.id);
            if (index !== -1) {
                socket.emit('revealToUser', cards[index]);
                io.to(currUser.room).emit('revealedUser', currUser.username)
            }
        });

        socket.on('endGame', (code) => {
            setInGame(code, false);
            io.to(code).emit('returnToLobby');
        });

        socket.on('disconnect', () => {
            const [user, index] = userLeave(socket.id);
            if (user) {
                cardLeave(user.room, index);
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

    return io
};