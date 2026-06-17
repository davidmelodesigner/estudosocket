const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const homepage = require("./home.js");
const conectserver = require("./conectserver.js");
const getallusers = require("./getusers.js");

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

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        if (data.message === "startserver") {

            ws.userId = Math.random().toString(36).substr(2, 9);

            playersid.push(ws.userId);
            players[ws.userId] = {
                id: ws.userId,
                x: data.x,
                y: data.y,
                z: data.z,
                rx: data.rx,
                ry: data.ry,
                rz: data.rz,
                walk: data.walk,
                run: data.run,
                onground: data.onground,
                atack: data.atack
            };

            conectserver(ws, data, wss);
        }

        // -------------------------
        // UPDATE
        // -------------------------
        if (data.message === "updateplayer") {

            players[ws.userId] = {
                ...players[ws.userId],
                ...data,
                id: ws.userId
            };
        
            console.log(players[ws.userId]);
        
            getallusers(ws, data, wss, players);
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
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
