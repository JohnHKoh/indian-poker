const socket = io();

let {code, name} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

code = code.toUpperCase();

let countdown = false;

//history.replaceState({}, null, code);
socket.emit('joinRoom', {code, name});

socket.on('roomUsers', ({room, users}) => {
    $("#roomCode").text('Room Code: ' + room);
    $("#usersList").html(`
        ${users.map(user => `<li class="list-group-item">${user.username}</li>`).join('')}
    `);
});

$("#startGame").click(function() {
    socket.emit('startGame', {"code": code});
});

socket.on('newCard', (card) => {
    $("body").load("inGame.html", () => {
        $("#exit").click(() => {
            socket.emit('endGame', code);
        });
        var timer = 5;
        countdown = setInterval(function () {
            $("#countdown").text(timer);
            if (--timer < 0) {
                clearInterval(countdown);
                countdown = false;
                $("#instructions").css("display","none");
                $("#card").attr("src", "cards/" + card);
                $("#reshuffle").click(() => {
                    if (countdown) return;
                    socket.emit('startGame', {"code": code, "reshuffle": 1});
                });
            }
        }, 1000);
    });
});

socket.on('dealCard', (card) => {
    $("#exit").click(() => {
        socket.emit('endGame', code);
    });
    var timer = 5;
    $("#countdown").text("Ready?");
    $("#instructions").css("display", "block");
    $("#card").attr("src", "cards/RED_BACK.svg");
    countdown = setInterval(function () {
        $("#countdown").text(timer);
        if (--timer < 0) {
            clearInterval(countdown);
            countdown = false;
            $("#instructions").css("display", "none");
            $("#card").attr("src", "cards/" + card);
        }
    }, 1000);
});

socket.on('returnToLobby', () => {
    window.location.href = "game.html?code=" + code + "&name=" + name;
});