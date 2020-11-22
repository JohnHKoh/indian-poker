const path = require('path');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

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

const io = require('./server/sockets').listen(server);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));