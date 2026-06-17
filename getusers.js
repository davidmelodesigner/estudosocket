module.exports = function getallusers(ws, data, wss, players) {

    const payload = JSON.stringify({
        message: "receiveusers",
        users: players
    });

    wss.clients.forEach(client => {

        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }

    });
};
