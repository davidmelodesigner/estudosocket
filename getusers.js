module.exports = function getallusers(ws, data, wss, players) {

    const payload = JSON.stringify({
        message: "receiveusers",
        users: players
    });

    wss.clients.forEach(client => {

        if (client.readyState === WebSocket.OPEN) {
            client.send(players);
        }

    });
};

module.exports = function getUser(ws, userid, wss) {

    const payload = JSON.stringify({
        message: "getuser",
        userid: userid
    });

    ws.send(payload);

    
};
