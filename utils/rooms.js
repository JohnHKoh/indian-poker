var rooms = []; // Hopefully one day we can reuse io.sockets.adapter.rooms...

function addRoom(code) {
    rooms.push(code);
}

function isValidRoom(code) {
    return rooms.indexOf(code) !== -1;
}

function removeRoom(code) {
    const index = rooms.findIndex(room => room === code);
    if (index !== -1) {
        return rooms.splice(index, 1)[0];
    }
}

module.exports = {
    addRoom,
    isValidRoom,
    removeRoom
};