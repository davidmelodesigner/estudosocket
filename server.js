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

    

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        // -------------------------
        // START
        // -------------------------
        if (data.message === "startserver") {

                // 🔒 impede duplicar player no mesmo socket
                if (ws.userId && players[ws.userId]) return;
            
                const id = data.userId || Math.random().toString(36).substr(2, 9);
            
                ws.userId = id;
            
                // 🔒 cria 1 vez só
                if (!players[id]) {
                    players[id] = {
                        id,
                        x: 0, y: 0, z: 0,
                        rx: 0, ry: 0, rz: 0,
                        lastSeen: Date.now()
                    };
                }
            
                ws.send(JSON.stringify({
                    message: "connected",
                    id
                }));
            }

        // -------------------------
        // UPDATE
        // -------------------------
        if (data.message === "updateplayer") {

            if (!players[ws.userId]) return;

            players[ws.userId].x = data.x;
            players[ws.userId].y = data.y;
            players[ws.userId].z = data.z;
            players[ws.userId].rx = data.rx;
            players[ws.userId].ry = data.ry;
            players[ws.userId].rz = data.rz;
            players[ws.userId].lastSeen = Date.now();
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

    const unique = new Map();

    for (const p of Object.values(players)) {
        if (!p || !p.id) continue;
        unique.set(p.id, p);
    }

    const snapshot = {
        message: "snapshot",
        players: Array.from(unique.values())
    };

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(snapshot));
        }
    });

}, 50);


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
