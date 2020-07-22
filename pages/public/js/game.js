const socket = io();

let {code, name} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

code = code.toUpperCase();

let countdown = false;

history.replaceState({}, null, code);
socket.emit('joinRoom', {code, name});

socket.on('roomUsers', ({room, users}) => {
    $("#roomCode").text('Room Code: ' + room);
    let i = 0;
    $("#usersList").html(`
        ${users.map(user => `<li id="${"player" + i++}" class="list-group-item"></li>`).join('')}
    `);
    for (let j = 0; j < i; j++) {
        let text = document.createTextNode(users[j].username);
        $("#player" + j).append(text);
    }
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
    window.location.href = "game?code=" + code + "&name=" + name;
});

socket.on('noSuchRoom', () => {
    window.location.href = "join.html?code=" + code + "&error=invalidCode";
});