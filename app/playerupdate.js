module.exports = function playerupdate(ws, data) {
    ws.send(JSON.stringify({
        message: 'playerupdate',
        respdata : data
    }));
};
