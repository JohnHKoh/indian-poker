const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const app = express();
const server = http.createServer(app);
const sessionMiddleware = session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
});
const io = require('./server/sockets').listen(server, sessionMiddleware);
const rejoinMiddleware = function(req, res, next) {
    if (sessionIsSet(req.session)) {
        if (req.url === '/onlineGame') {
            res.sendFile(path.join(__dirname, 'pages/onlineGame.html'));
        }
        else if (req.url === '/mobileGame') {
            res.sendFile(path.join(__dirname, 'pages/mobileGame.html'));
        }
        else {
            res.sendFile(path.join(__dirname, 'pages/game.html'));
        }
    }
    else {
        next();
    }
};
function sessionIsSet(session) {
    return session.code && session.name;
}

app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'pages/public')));
app.use(rejoinMiddleware);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/home.html'));
});
app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/join.html'));
});
app.get('/new', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/new.html'));
});
app.get('/how-to-play', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/how-to-play.html'));
});
app.get('/:id', (req, res) => {
    res.redirect('join?code=' + req.params.id);
});
app.all('*', (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));