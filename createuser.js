
module.exports = function createUser(ws, userid, wss)  {
     const payload = JSON.stringify({
        message: "userlogued",
        userid: userid
    });
    ws.send(payload);
};
