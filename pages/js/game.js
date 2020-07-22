const socket = io();

let {code, name} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

code = code.toUpperCase();

//history.replaceState({}, null, code);
socket.emit('joinRoom', {code, name});

socket.on('roomUsers', ({room, users}) => {
    $("#roomCode").text('Room Code: ' + room);
    $("#usersList").html(`
        ${users.map(user => `<li class="list-group-item">${user.username}</li>`).join('')}
    `);
});

$("#startGame").click(function() {
    socket.emit('startGame', code);
});

socket.on('newCard', (card) => {
    $("body").load("inGame.html", () => {
        $("#card").attr("src", "cards/" + card);
        $("#reshuffle").click(() => {
            socket.emit('startGame', code);
        });
        $("#exit").click(() => {
            socket.emit('endGame', code);
        });
    });
});

socket.on('returnToLobby', () => {
    window.location.href = "game.html?code=" + code + "&name=" + name;
});