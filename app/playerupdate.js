module.exports = function playerupdate(wss, ws, data) {

    wss.clients.forEach(function(client) {

        if (client.readyState === 1) {

            client.send(JSON.stringify({
                message: 'playerupdate',
                respdata: data
            }));

        }

    });

};
