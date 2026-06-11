const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const homepage = require("./app/home.js"); // NÃO MEXER

const app = express();

/* ======================
   HOME
====================== */
app.get("/", (req, res) => {
    homepage(req, res);
});

/* ======================
   SERVER
====================== */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* ======================
   MEMÓRIA SIMPLES (SEM MODULES)
====================== */
const connections = {};
const players = {};

/* ======================
   WS
====================== */
wss.on("connection", (ws) => {

    ws.on("message", (msg) => {

        let data;
        try {
            data = JSON.parse(msg.toString());
        } catch (e) {
            return;
        }

        /* ======================
           CONNECT
        ====================== */
        if (data.message === "sendconnect") {

            const id = data.playerid;
            if (!id) return;

            ws.playerid = id;
            connections[id] = ws;

            if (!players[id]) {
                players[id] = {
                    playerid: id,
                    x: 0, y: 0, z: 0,
                    rx: 0, ry: 0, rz: 0
                };
            }

            console.log("CONNECT:", id);

            // envia quem já está online
            for (const pid in players) {
                if (pid === id) continue;

                ws.send(JSON.stringify({
                    message: "playerjoin",
                    playerid: pid,
                    ...players[pid]
                }));
            }

            // avisa outros
            for (const pid in connections) {
                if (pid === id) continue;

                connections[pid].send(JSON.stringify({
                    message: "playerjoin",
                    playerid: id,
                    ...players[id]
                }));
            }

            return;
        }

        /* ======================
           UPDATE
        ====================== */
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

            return;
        }

    });

    /* ======================
       DISCONNECT
    ====================== */
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

/* ======================
   START
====================== */
server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
