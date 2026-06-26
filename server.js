const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const homepage = require("./home.js");

const app = express();

app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

// -------------------------
// CONNECTION
// -------------------------
wss.on("connection", (ws) => {

    ws.userId = Math.random().toString(36).substr(2, 9);
    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        if(data.message=="startserver"){
            ws.send(JSON.stringify({
                    message: "connected",
                    userId: ws.userId
                }));
        }

       
    });

    ws.on("close", () => {
        delete players[ws.userId];
    });
});




// -------------------------
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
