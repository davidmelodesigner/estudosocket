const players = require("./players");

module.exports = function broadcastusers(wss, ws, data) {

    const users = {};

    for (const id in players) {

        if (id != data.playerid) {
            users[id] = players[id];
        }

    }

    ws.send(JSON.stringify({
        message: "allusers",
        users: users
    }));

};
