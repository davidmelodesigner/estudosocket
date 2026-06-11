const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        if (data.message === "sendconnect") {

            console.log("PLAYER:", data.playerid);

            ws.send(JSON.stringify({
                message: "serverconnected"
            }));
        }
    });

});

server.listen(3000, () => {
    console.log("SERVER ONLINE");
});
