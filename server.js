const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const homepage = require("./app/home.js");

const app = express();

app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};
const connections = {};

/* =========================
   BROADCAST
========================= */
function broadcast(msg) {

    const data = JSON.stringify(msg);

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(data);
        }
    });
}

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

            if (!id) return;

            // remove duplicado
            if (connections[id]) {
                try {
                    connections[id].terminate();
                } catch (e) {}
            }

            ws.playerid = id;

            connections[id] = ws;
            players[id] = data;

            // avisa todos
            broadcast({
                message: "playerjoin",
                playerid: id
            });

            return;
        }

        /* =========================
           UPDATE
        ========================= */
        if (data.message === "playerupdate") {

            const id = data.playerid;

            connections[id] = ws;
            players[id] = data;

            broadcast({
                message: "playerupdate",
                playerid: id,
                x: data.x,
                y: data.y,
                z: data.z,
                rx: data.rx,
                ry: data.ry,
                rz: data.rz
            });

            return;
        }

        /* =========================
           GET ALL USERS
        ========================= */
        if (data.message === "getallusers") {

            ws.send(JSON.stringify({
                message: "allusers",
                users: players
            }));

            return;
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

        broadcast({
            message: "playerleave",
            playerid: id
        });

        console.log("SAIU:", id);
    });
});

/* =========================
   START (RAILWAY SAFE)
========================= */
const PORT = process.env.PORT;

server.listen(PORT, "0.0.0.0", () => {
    console.log("SERVER ONLINE:", PORT);
});
