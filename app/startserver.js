module.exports = function startserver(ws, data) {
    ws.send(JSON.stringify({
        message: "quitgame"
    }));
};
