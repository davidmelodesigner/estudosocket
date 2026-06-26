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

    players[ws.userId] = {
        id: ws.userId,
        x: 0, y: 0, z: 0,
        rx: 0, ry: 0, rz: 0,
        lastSeen: Date.now()
    };

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        // -------------------------
        // START
        // -------------------------
        if (data.message === "startserver") {

            ws.send(JSON.stringify({
                message: "connected",
                id: ws.userId
            }));
        }

        // -------------------------
        // UPDATE
        // -------------------------
        if (data.message === "updateplayer") {

            if (!players[ws.userId]) return;
        
            players[ws.userId] = {
                ...players[ws.userId],
                ...data,          // <- pega tudo que vier do client
                lastSeen: Date.now()
            };
        }

        // -------------------------
        // PING
        // -------------------------
        if (data.message === "ping") {

            if (players[ws.userId]) {
                players[ws.userId].lastSeen = Date.now();
            }
        }

        // -------------------------
        // DISCONNECT MANUAL
        // -------------------------
        if (data.message === "disconnect") {

            const id = ws.userId;
        
            delete players[id];
        
            wss.clients.forEach(client => {
        
                if (client.readyState !== 1) return;
        
                client.send(JSON.stringify({
                    message: "remove",
                    userId: id
                }));
            });
        }
    });

    ws.on("close", () => {
        delete players[ws.userId];
    });
});


// -------------------------
// SNAPSHOT
// -------------------------
setInterval(() => {

    const snapshot = {
        message: "snapshot",
        players: Object.values(players)
    };

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(snapshot));
        }
    });

}, 20);


// -------------------------
// GHOST CLEANER
// -------------------------
setInterval(() => {

    const now = Date.now();
    const timeout = 5000;

    for (const id in players) {

        if (now - players[id].lastSeen > timeout) {
            delete players[id];
        }
    }

}, 2000);


// -------------------------
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
