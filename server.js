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
const playersid = [];

wss.on("connection", (ws) => {

    players[ws.userId] = {
        id: ws.userId,
        x: 0, y: 0, z: 0,
        rx: 0, ry: 0, rz: 0,
        lastSeen: Date.now()
    };

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

         if (data.message === "createuser") {
               createUser(ws, data.userId, wss);
                
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
        if (data.message === "disconnect") {

            if (data.userId === "" || data.userId == null) {
        
                
                ws.send(JSON.stringify({
                    message: "userlogout",
                }));
        
                console.log("USERLOGOUT SENT");
        
            } else {
                logoutUser(ws, data.userId, wss);
                
            }
        }
        if (data.message === "getuser") {
               getUser(ws, data.userId, wss);
               
         }

        
        
    });

    ws.on("close", () => {
        console.log("Saiu:", ws.userId);

        const index = playersid.indexOf(ws.userId);

        if (index !== -1) {
            playersid.splice(index, 1);
        }

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
