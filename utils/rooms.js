var rooms = []; // Hopefully one day we can reuse io.sockets.adapter.rooms...

function addRoom(code) {
    let checked = true;
    let cards = [];
    let room = {code, checked, cards};
    rooms.push(room);
}

function isValidRoom(code) {
    return rooms.findIndex(room => room.code === code) !== -1;
}

function getChecked(code) {
    const index = rooms.findIndex(room => room.code === code);
    if (index !== -1) {
        return rooms[index].checked;
    }
    return null;
}

function setChecked(code, checked) {
    const index = rooms.findIndex(room => room.code === code);
    if (index !== -1) {
        rooms[index].checked = checked;
        return rooms[index].checked;
    }
    return null;
}

function getCards(code) {
    const index = rooms.findIndex(room => room.code === code);
    if (index !== -1) {
        return [...rooms[index].cards]; // deep copy
    }
    return null;
}

function setCards(code, cards) {
    const index = rooms.findIndex(room => room.code === code);
    if (index !== -1) {
        rooms[index].cards = cards;
        return rooms[index].cards;
    }
    return null;
}

function removeRoom(code) {
    const index = rooms.findIndex(room => room.code === code);
    if (index !== -1) {
        return rooms.splice(index, 1)[0];
    }
}

module.exports = {
    addRoom,
    isValidRoom,
    getChecked,
    setChecked,
    getCards,
    setCards,
    removeRoom
};