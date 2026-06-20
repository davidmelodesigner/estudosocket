const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const homepage = require("./home.js");
const createUser = require("./createuser.js");
const logoutUser = require("./logout.js");
const { getUser } = require("./getusers.js");

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
        const id = data.userId;

        if (!id) return;

        // -------------------------
        // CREATE USER
        // -------------------------
        if (data.message === "createuser") {
            createUser(ws, id, wss);
        }

        // -------------------------
        // UPDATE PLAYER
        // -------------------------
        if (data.message === "updateplayer") {

            if (!players[id]) {

                players[id] = {
                    id,
                    x: 0, y: 0, z: 0,
                    rx: 0, ry: 0, rz: 0,
                    lastSeen: Date.now()
                };

                // 🔥 envia estado atual para quem acabou de entrar
                ws.send(JSON.stringify({
                    message: "snapshot",
                    players: Object.values(players)
                }));
            }

            players[id] = {
                ...players[id],
                ...data,
                lastSeen: Date.now()
            };
        }

        // -------------------------
        // PING
        // -------------------------
        if (data.message === "ping") {

            if (players[id]) {
                players[id].lastSeen = Date.now();
            }
        }

        // -------------------------
        // DISCONNECT
        // -------------------------
        if (data.message === "disconnect") {

            delete players[id];

            logoutUser(ws, id, wss);
        }

        // -------------------------
        // GET USER
        // -------------------------
        if (data.message === "getuser") {
            getUser(ws, id, wss);
        }
    });

    ws.on("close", () => {
        // não depende de ws.userId (evita bug)
        // opcional: limpeza pode ser feita via ping timeout
    });
});


// -------------------------
// SNAPSHOT GLOBAL
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

}, 50);


// -------------------------
// GHOST CLEANER
// -------------------------
setInterval(() => {

    const now = Date.now();
    const timeout = 20000;

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
