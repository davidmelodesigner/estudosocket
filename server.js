const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const homepage = require("./home.js");
const conectserver = require("./conectserver.js");

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

    players[ws.userId] = {
        id: ws.userId,
        x: 0, y: 0, z: 0,
        rx: 0, ry: 0, rz: 0,
        lastSeen: Date.now()
    };

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());
        conectserver(ws, data, wss)
        
    });

    ws.on("close", () => {
        delete players[ws.userId];
    });
});



// -------------------------
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
