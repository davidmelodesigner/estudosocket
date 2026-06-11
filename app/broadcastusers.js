const players = {};

module.exports = function broadcastusers(wss, ws, data) {

    if (data.playerid) {
        players[data.playerid] = data;
    }

    ws.send(JSON.stringify({
        message: "allusers",
        users: players
    }));

};
