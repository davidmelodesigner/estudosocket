const players = require("./players");

module.exports = function playerupdate(wss, ws, data, connections) {

    players[data.playerid] = data;

    connections[data.playerid] = ws;

    wss.clients.forEach((client) => {

        if (client.readyState === 1) {

            client.send(JSON.stringify({
                message: "playerupdate",
                respdata: data
            }));

        }

    });

};
