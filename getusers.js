function getallusers(ws, data, wss, players) {

    const payload = JSON.stringify({
        message: "receiveusers",
        users: players
    });

    wss.clients.forEach(client => {

        if (client.readyState === 1) {
            client.send(payload);
        }

    });
}

function getUser(ws, userid, wss) {

    const payload = JSON.stringify({
        message: "getuser",
        userid: userid
    });

    ws.send(payload);
}

module.exports = {
    getallusers,
    getUser
};
