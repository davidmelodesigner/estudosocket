
module.exports = function getallusers(ws, data, wss,players) {

    const payload = JSON.stringify({
        message: "receiveusers",
        users: players, 
    });

    ws.send(payload);
};
