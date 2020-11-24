let rooms = [];

class Rooms {

    static addRoom(code) {
        let checked = false;
        let cards = [];
        let inGame = false;
        let isMobileGame = false;
        let room = {code, checked, cards, inGame, isMobileGame};
        rooms.push(room);
    }

    static isValidRoom(code) {
        return rooms.findIndex(room => room.code === code) !== -1;
    }

    static getChecked(code) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            return rooms[index].checked;
        }
        return null;
    }

    static setChecked(code, checked) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            rooms[index].checked = checked;
            return rooms[index].checked;
        }
        return null;
    }

    static getInGame(code) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            return rooms[index].inGame;
        }
        return null;
    }

    static setInGame(code, inGame) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            rooms[index].inGame = inGame;
            return rooms[index].inGame;
        }
        return null;
    }

    static getIsMobileGame(code) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            return rooms[index].isMobileGame;
        }
        return null;
    }

    static setIsMobileGame(code, isMobileGame) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            rooms[index].isMobileGame = isMobileGame;
            return rooms[index].isMobileGame;
        }
        return null;
    }

    static getCards(code) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            return [...rooms[index].cards]; // deep copy
        }
        return null;
    }

    static setCards(code, cards) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            rooms[index].cards = cards;
            return rooms[index].cards;
        }
        return null;
    }

    static cardLeave(code, index) {
        const roomIndex = rooms.findIndex(room => room.code === code);
        if (roomIndex !== -1) {
            return rooms[roomIndex].cards.splice(index, 1)[0];
        }
    }

    static removeRoom(code) {
        const index = rooms.findIndex(room => room.code === code);
        if (index !== -1) {
            return rooms.splice(index, 1)[0];
        }
    }
}

module.exports = Rooms;