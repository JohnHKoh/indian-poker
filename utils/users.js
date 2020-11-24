const users = [];

class Users {
    static userJoin(id, username, room) {
        const user = {id, username, room};
        users.push(user);
        return user;
    }

    static setUserSocketId(sessionId, socketId) {
        let user = Users.getUserById(sessionId);
        user.socketId = socketId;
    }

    static getRoomUsers(room) {
        return users.filter(user => user.room === room);
    }

    static getUserById(id) {
        return users.filter(user => user.id === id)[0];
    }

    static userLeave(id) {
        const index = users.findIndex(user => user.id === id);
        if (index !== -1) {
            return [users.splice(index, 1)[0], index];
        }
        else return [];
    }
}

module.exports = Users;