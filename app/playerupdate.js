const players = require("./players");

module.exports = function playerupdate(wss, ws, data) {

    players[data.playerid] = data;

    wss.clients.forEach((client) => {

        if (client.readyState === 1) {

            client.send(JSON.stringify({
                message: "playerupdate",
                respdata: data
            }));

        }

    });

};
