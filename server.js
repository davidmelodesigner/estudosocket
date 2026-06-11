const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const homepage = require("./app/home.js");
const startserver = require("./app/startserver.js");
const playerupdate = require("./app/playerupdate.js");
const broadcastusers = require("./app/broadcastusers.js");

const players = require("./app/players");
const connections = {};

const app = express();

/* ======================
   HOME ROUTE (NÃO MEXIDO)
====================== */
app.get("/", (req, res) => {
    homepage(req, res);
});

/* ======================
   SERVER HTTP + WS
====================== */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* ======================
   WEBSOCKET CONNECTION
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
           CONNECT PLAYER
        ====================== */
        if (data.message === "sendconnect") {

            const id = data.playerid;

            ws.playerid = id;
            connections[id] = ws;

            // cria player se não existir
            if (!players[id]) {
                players[id] = {
                    playerid: id,
                    x: 0,
                    y: 0,
                    z: 0,
                    rx: 0,
                    ry: 0,
                    rz: 0
                };
            }

            console.log("CONNECT:", id);

            /* ======================
               ENVIA PLAYERS EXISTENTES
               (snapshot inicial)
            ====================== */
            for (const pid in players) {

                if (pid === id) continue;

                ws.send(JSON.stringify({
                    message: "playerjoin",
                    playerid: pid,
                    ...players[pid]
                }));
            }

            /* ======================
               AVISA OUTROS PLAYERS
            ====================== */
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
           PLAYER UPDATE
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

            // envia update para outros players
            for (const pid in connections) {

                if (pid === id) continue;

                connections[pid].send(JSON.stringify({
                    message: "playerupdate",
                    ...players[id]
                }));
            }

            return;
        }

        /* ======================
           GET USERS (se quiser usar depois)
        ====================== */
        if (data.message === "getallusers") {
            broadcastusers(wss, ws, data, connections);
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
   START SERVER
====================== */
server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
