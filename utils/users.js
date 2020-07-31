const users = [];

function userJoin(id, username, room) {
    const user = {id, username, room};
    users.push(user);
    return user;
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function getUserById(id) {
    return users.filter(user => user.id === id)[0];
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return [users.splice(index, 1)[0], index];
    }
    else return [];
}

module.exports = {
    userJoin,
    getRoomUsers,
    getUserById,
    userLeave
};