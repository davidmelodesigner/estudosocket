
module.exports = function createUser(ws, data, wss)  {
     const payload = JSON.stringify({
        message: "userlogued",
        userid: data
    });
    ws.send(payload);
};
