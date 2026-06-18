module.exports = function createUser(ws, data, wss) {

    const payload = JSON.stringify({
        message: "usercreated",
        type: data.type,
        userid: ws.userId
    });

    ws.send(payload);
};
