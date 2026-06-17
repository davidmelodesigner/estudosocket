
module.exports = function conectserver(ws, data, wss) {

    const payload = JSON.stringify({
        message: "userdisconnect",
        type:data.type
        userid: userId
    });

  ws.send(JSON.stringify(payload));
};
