const socketio = require('socket.io');

const {
    makeCode,
    shuffle
} = require('../utils/generator.js');
const {
    userJoin,
    setUserSocketId,
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

module.exports.listen = function(server, sessionMiddleware) {
    const io = socketio(server);

    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    io.on('connection', socket => {
        const session = socket.request.session;
        const sessionStore = socket.request.sessionStore;
        const sessionID = socket.request.sessionID;
        session.cookie.maxAge = null;
        if (getUserById(sessionID)) setUserSocketId(sessionID, socket.id);
        session.save();

        function joinRoomAsSession(code, name) {
            session.code = code;
            session.name = name;
            session.save();
            userJoin(sessionID, name, code);
            socket.emit('roomJoined', code);
        }

        socket.on('newGame', name => {
            const code = makeCode(4);
            addRoom(code);
            joinRoomAsSession(code, name)
        });

        socket.on('getSessionInfo', ()=> {
            socket.emit('sessionInfoRecv', {
                sessionName: session.name,
                sessionCode: session.code,
                sessionInGame: session.inGame
            })
        });
        socket.on('joinGame', ({name, room}) => {
            room = room.toUpperCase();
            if (isValidRoom(room)) {
                let users = getRoomUsers(room);
                if (users && users.length >= MAX_PLAYERS) {
                    socket.emit('maxPlayersReached');
                }
                else if (users && users.findIndex(user => user.username === name) !== -1) {
                    socket.emit('nameInUse');
                }
                else {
                    if (!io.sockets.adapter.rooms[room]) {
                        userJoin(sessionID, name, room);
                        socket.join(room);
                    }
                    joinRoomAsSession(room, name)
                }
            }
            else {
                socket.emit('noSuchRoom');
            }
        });

        function joinRoom(code) {
            socket.join(code);
            io.to(code).emit('roomUsers', {
                room: code,
                users: getRoomUsers(code),
                checked: getChecked(code),
                inGame: getInGame(code)
            })
        }

        socket.on('joinRoom', (code) => {
            joinRoom(code);
        });

        socket.on('rejoinRoom', (code) => {
            joinRoom(code);
            sendCards(code)
        });

        function setInGameHandler(code, inGame) {
            setInGame(code, inGame);
            io.to(code).emit('setInGame', inGame);
        }

        socket.on('startGame', (data) => {
            let code = session.code;
            let reshuffle = data ? data.reshuffle : false;
            if (getInGame(code) && !reshuffle) {
                socket.emit('gameInProgress');
                return;
            }
            setInGameHandler(code, true);
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
            var action = reshuffle ? 'dealCard' : 'newCard';
            for (let i = 0; i < users.length; i++) {
                io.to(users[i].socketId).emit(action, cards[i]);
            }
        }

        function startOnlineGame(code, reshuffle) {
            let users = getRoomUsers(code);
            let cards = shuffle(users.length);
            setCards(code, cards);
            io.to(code).emit('requestInit', code);
        }

        function sendCards(code) {
            let users = getRoomUsers(code);
            let cards = getCards(code);
            let currUser = users.findIndex(user => user.id === sessionID);
            if (currUser !== -1) {
                cards[currUser] = "RED_BACK.svg";
            }
            socket.emit('sendCards', cards);
        }

        socket.on('requestCards', code => {
            sendCards(code)
        });

        socket.on('mobileCheck', (checked) => {
            let room = Object.keys(socket.rooms)[1];
            if (room) {
                setChecked(room, checked);
                io.to(room).emit('checkChanged', checked);
            }
        });

        socket.on('verifyUser', name => {
            let currUser = getUserById(sessionID);
            socket.emit('sendVerification', currUser.username === name);
        });

        socket.on('guessChanged', ({id, option}) => {
            let currUser = getUserById(sessionID);
            io.to(currUser.room).emit('changeGuess', {id, option});
        });

        socket.on('revealCard', () => {
            let currUser = getUserById(sessionID);
            let users = getRoomUsers(currUser.room);
            let cards = getCards(currUser.room);
            const index = users.findIndex(user => user.id === currUser.id);
            if (index !== -1) {
                socket.emit('revealToUser', cards[index]);
                io.to(currUser.room).emit('revealedUser', currUser.username)
            }
        });

        socket.on('endGame', (code) => {
            setInGameHandler(code, false);
            io.to(code).emit('returnToLobby');
        });

        function setSessionInGame(val) {
            session.inGame = val;
            session.save();
        }

        socket.on('setSessionInGame', (val) => {
            setSessionInGame(val);
        });

        function disconnectUser() {
            const [user, index] = userLeave(sessionID);
            if (user) {
                cardLeave(user.room, index);
                let users = getRoomUsers(user.room);
                if (users.length === 0) {
                    let deleted = removeRoom(user.room);
                    if (deleted) console.log(user.room + ' deleted.')
                }
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: users
                });
            }
        }

        socket.on('leaveGame', () => {
            session.name = null;
            session.code = null;
            session.save();
            disconnectUser();
        });

        socket.on('disconnect', () => {
            session.cookie.maxAge = 5000;
            session.save();
            setTimeout(() => {
                sessionStore.all((error, sessions) => {
                    let id_index = 0;
                    let sessionIsAlive = Object.entries(sessions).filter(element => element[id_index] === sessionID).length > 0;
                    if (!sessionIsAlive) {
                        disconnectUser();
                    }
                });
            }, 5000);

        });
    });

    return io
};