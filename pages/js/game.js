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
        $("#exit").click(() => {
            socket.emit('endGame', code);
        });
        var timer = 5;
        var countdown = setInterval(function () {
            $("#countdown").text(timer);
            console.log(timer);
            if (--timer < 0) {
                clearInterval(countdown);
                $("#instructions").css("display","none");
                $("#card").attr("src", "cards/" + card);
                $("#reshuffle").click(() => {
                    socket.emit('startGame', code);
                });
            }
        }, 1000);
    });
});

socket.on('returnToLobby', () => {
    window.location.href = "game.html?code=" + code + "&name=" + name;
});