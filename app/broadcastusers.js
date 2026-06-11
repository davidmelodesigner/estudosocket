const players = require("./players");

module.exports = function broadcastusers(wss, ws, data, connections) {

    const users = {};

    for (const id in players) {

        if (connections[id] && connections[id].readyState === 1) {

            if (id != data.playerid) {
                users[id] = players[id];
            }

        }
    }

    ws.send(JSON.stringify({
        message: "allusers",
        users: users
    }));

};
