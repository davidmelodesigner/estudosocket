const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.get("/", (req, res) => {
    res.send("SERVER ONLINE");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};
const connections = {};

/* =========================
   CONNECTION
========================= */
wss.on("connection", (ws) => {

    ws.on("message", (msg) => {

        let data;
        try {
            data = JSON.parse(msg.toString());
        } catch (e) {
            return;
        }

        /* =========================
           CONNECT
        ========================= */
        if (data.message === "sendconnect") {

            const id = data.playerid;

            ws.playerid = id;
            connections[id] = ws;

            // cria player se não existir
            if (!players[id]) {
                players[id] = {
                    playerid: id,
                    x: 0, y: 0, z: 0,
                    rx: 0, ry: 0, rz: 0
                };
            }

            console.log("CONNECT:", id);

            /* =========================
               1. ENVIA PLAYERS EXISTENTES
            ========================= */
            for (const pid in players) {
                if (pid === id) continue;

                ws.send(JSON.stringify({
                    message: "playerjoin",
                    playerid: pid,
                    ...players[pid]
                }));
            }

            /* =========================
               2. AVISA OUTROS SOBRE NOVO PLAYER
            ========================= */
            for (const pid in connections) {
                if (pid === id) continue;

                connections[pid].send(JSON.stringify({
                    message: "playerjoin",
                    playerid: id,
                    ...players[id]
                }));
            }
        }

        /* =========================
           UPDATE POSITION
        ========================= */
        if (data.message === "playerupdate") {

            const id = data.playerid;
            if (!players[id]) return;

            players[id] = {
                playerid: id,
                x: data.x,
                y: data.y,
                z: data.z,
                rx: data.rx,
                ry: data.ry,
                rz: data.rz
            };

            for (const pid in connections) {
                if (pid === id) continue;

                connections[pid].send(JSON.stringify({
                    message: "playerupdate",
                    ...players[id]
                }));
            }
        }
    });

    /* =========================
       DISCONNECT
    ========================= */
    ws.on("close", () => {

        const id = ws.playerid;
        if (!id) return;

        delete connections[id];
        delete players[id];

        console.log("DISCONNECT:", id);

        for (const pid in connections) {
            connections[pid].send(JSON.stringify({
                message: "playerleave",
                playerid: id
            }));
        }
    });
});

/* =========================
   START SERVER
========================= */
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
