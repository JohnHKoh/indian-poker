const socket = io();

let {code, name} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});

$("#mobileCheck, #checkicon").click((e)=> {
    e.stopPropagation();
    return true;
});

$("#checkform").click(function() {
    let box = $("#mobileCheck");
    let checked = box.prop('checked');
    box.prop('checked', !checked);
    socket.emit('mobileCheck', !checked);
});

socket.on('checkChanged', checked => {
    $("#mobileCheck").prop('checked', checked);
});

code = code.toUpperCase();

let countdown = false;
let usersList = [];

history.replaceState({}, null, code);
socket.emit('joinRoom', {code, name});

socket.on('roomUsers', ({room, users, checked, inGame}) => {
    usersList = users;
    $("#roomCode").text('Room Code: ' + room);
    $("#mobileCheck").prop('checked', checked);
    if (inGame) {
        var start = $("#startGame");
        start.addClass('disabled');
        start.text("Game in progress...")
    }
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

socket.on('gameInProgress', () => {
    var start = $("#startGame");
    start.addClass('disabled');
    start.text("Game in progress...")
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

socket.on('requestInit', code => {
   socket.emit('requestCards', code);
});

socket.on('sendCards', cards => {
    $("body").load("onlineGame.html", () => {
        $("#roomCode").text('Room Code: ' + code);
        $("#exit").click(() => {
            socket.emit('endGame', code);
        });
        var list = $("#list");
        var x = cards.length; // for formula purposes...
        //var height = 100 + (x/Math.sqrt(x) * Math.sqrt(10000 * (x-1)));
        var height = 200*((x-1)/(x+3)) + (200*x)/Math.sqrt(x);
        list.css("height", height + "px");
        var zero_start = 0; // if you want to start from a different position, should be positive

        var updateLayout = function(listItems){
            var offsetAngle = (360 / (listItems.length));
            var rad = height/2;
            for(var i = 0; i < listItems.length; i ++){

                var rotateAngle = zero_start + (offsetAngle * i || 0);

                $(listItems[i]).css("transform", "rotate(" + rotateAngle + "deg) translate(0px, -" + rad + "px) rotate(-" + rotateAngle + "deg)")
            }
        };

        for (i = 0; i < cards.length; i++) {
            let card = cards[i];
            let user = usersList[i];
            var src = 'cards/' + card;
            let id = card === "RED_BACK.svg" ? `id="userCard"` : "";
            let disabled = card === "RED_BACK.svg" ? "" : "disabled";
            var username = encodeURI(user.username);
            var listItem = $("" +
                "<li class='list-item'>\n" +
                "  <img class='card-sm' src='" + src + "' " + id + ">\n" +
                "  <p class='text-center name-plate' id='" + username + "-name-plate'></p>\n" +
                "  <div class=\"input-group input-group-sm mb-3\">\n" +
                "    <div class=\"input-group-prepend\">\n" +
                "      <label class=\"input-group-text\">Guess 1</label>\n" +
                "    </div>\n" +
                "    <select class=\"custom-select rank\" id='firstguess-" + i + "' " + disabled + ">\n" +
                "      <option>-</option>\n" +
                "    </select>\n" +
                "  </div>\n" +
                "  <div class=\"input-group input-group-sm mb-3\">\n" +
                "    <div class=\"input-group-prepend\">\n" +
                "      <label class=\"input-group-text\">Guess 2</label>\n" +
                "    </div>\n" +
                "    <select class=\"custom-select rank\" id='secondguess-a-" + i + "' " + disabled + ">\n" +
                "      <option>-</option>\n" +
                "    </select>\n" +
                "    <select class=\"custom-select\" id='secondguess-b-" + i + "' " + disabled + " style=\"padding-right: 0;\">\n" +
                "      <option>-</option>\n" +
                "      <option value='2'>2</option>\n" +
                "      <option value='3'>3</option>\n" +
                "      <option value='4'>4</option>\n" +
                "      <option value='5'>5</option>\n" +
                "      <option value='6'>6</option>\n" +
                "      <option value='7'>7</option>\n" +
                "      <option value='8'>8</option>\n" +
                "      <option value='9'>9</option>\n" +
                "      <option value='10'>10</option>\n" +
                "      <option value='J'>J</option>\n" +
                "      <option value='Q'>Q</option>\n" +
                "      <option value='K'>K</option>\n" +
                "      <option value='A'>A</option>\n" +
                "    </select>\n" +
                "  </div>\n" +
                "</li>\n");
            list.append(listItem);
            var listItems = $(".list-item");
            let text = document.createTextNode(user.username);
            $(document.getElementById(username + "-name-plate")).append(text);
            updateLayout(listItems);
        }

        for (i = 1; i <= cards.length; i++) {
            $(".rank").append(`<option value="${i}">${i}</option>\n`);
        }

        $("#reveal").click(() => {
            socket.emit('revealCard');
        });

        $( "select" ).change(function() {
            var selected = $(this).children("option:selected").val();
            var id = $(this).attr('id');
            socket.emit('guessChanged', {"id": id, "option": selected});
        });

        socket.on('revealToUser', card => {
            $("#userCard").attr('src', 'cards/' + card);
            $("#reveal").attr('disabled', true);
        });

        socket.on('revealedUser', name => {
            var username = encodeURI(name);
            $(document.getElementById(username + "-name-plate")).css("color", "#007bff");
        });

        socket.on('changeGuess', ({id, option}) => {
            $("#" + id).val(option);
        });
    });
});


socket.on('returnToLobby', () => {
    window.location.href = "game?code=" + code + "&name=" + name;
});

socket.on('noSuchRoom', () => {
    window.location.href = "join.html?code=" + code + "&error=invalidCode";
});

socket.on('maxPlayersReached', () => {
    window.location.href = "join.html?code=" + code + "&error=roomFull";
});

socket.on('nameInUse', () => {
    window.location.href = "join.html?code=" + code + "&error=nameInUse";
});