
module.exports = function getallusers(ws, data, wss) {

    const payload = JSON.stringify({
        message: "connected",
        type: data.type,
        userid: ws.userId
    });

    ws.send(payload);
};
