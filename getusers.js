
module.exports = function getallusers(ws, data, wss,players) {

    const payload = JSON.stringify({
        message: "connected",
        users: players, 
    });

    ws.send(payload);
};
