const socket = io();

let {code, error} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

if (code) {
    $("#roomInput").val(code);
}

if (error === "invalidCode") {
    $("#noRoomError").html("<small id=\"roomHelp\" class=\"form-text text-danger mt-0\">Room does not exist.</small>");
}

$('input').keydown(function(e){
    if(e.keyCode == 13)
    {
        e.preventDefault();
        $("#" + $(this).data('target')).click();
    }
});

$("#newGame").click(function() {
    $("#noNameError").empty();
    const name = $("#nameInput").val();
    if (name === '') {
        $("#noNameError").html("<small id=\"nameHelp\" class=\"form-text text-danger mt-0\">Input a name.</small>");
    }
    else {
        socket.emit('newGame', name)
    }
});

$("#joinGame").click(function() {
    $("#noNameError").empty();
    $("#noRoomError").empty();
    const name = $("#nameInput").val();
    const room = $("#roomInput").val();
    if (name === '') {
        console.log('here');
        $("#noNameError").html("<small id=\"nameHelp\" class=\"form-text text-danger mt-0\">Input a name.</small>");
    }
    else if (room === '') {
        $("#noRoomError").html("<small id=\"roomHelp\" class=\"form-text text-danger mt-0\">Input a room code.</small>");
    }
    else {
        socket.emit('joinGame', {name, room})
    }
});

socket.on('roomCreated', code => {
    const name = $("#nameInput").val();
    window.location.href = "game?code=" + code + "&name=" + name;
});

socket.on('maxPlayersReached', () => {
    $("#noRoomError").html("<small id=\"roomHelp\" class=\"form-text text-danger mt-0\">Maximum number of players in room reached.</small>");
});

socket.on('noSuchRoom', () => {
    $("#noRoomError").html("<small id=\"roomHelp\" class=\"form-text text-danger mt-0\">Room does not exist.</small>");
});