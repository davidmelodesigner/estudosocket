module.exports = function createUser(ws, data, wss) {

    const payload = JSON.stringify({
        message: "usercreated"
    });

    ws.send(payload);
};
