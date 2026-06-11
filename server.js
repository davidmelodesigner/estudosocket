const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const homepage = require("./app/home.js");

const app = express();

/* ======================
   ROUTE HOME (CORRETO)
====================== */

app.get("/", (req, res) => {
    homepage(req, res);
});

/* ======================
   HTTP SERVER
====================== */

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* ======================
   WEBSOCKET CLIENTS
====================== */

const clients = new Map();

/* ======================
   CONNECTION
====================== */

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {

        const data = JSON.parse(msg);

        const id = data.playerid;

        if (data.message === "connect") {

            ws.playerid = id;
            clients.set(id, ws);

            broadcast({
                message: "join",
                playerid: id
            }, ws);

            return;
        }

        if (data.message === "update") {

            broadcast({
                message: "update",
                playerid: id,
                x: data.x,
                y: data.y,
                z: data.z,
                rx: data.rx,
                ry: data.ry,
                rz: data.rz
            }, ws);

            return;
        }
    });

    ws.on("close", () => {

        const id = ws.playerid;

        if (!id) return;

        clients.delete(id);

        broadcast({
            message: "leave",
            playerid: id
        }, ws);
    });
});

/* ======================
   BROADCAST SYSTEM
====================== */

function broadcast(data, ignore) {

    const msg = JSON.stringify(data);

    for (const client of wss.clients) {

        if (client.readyState === 1 && client !== ignore) {
            client.send(msg);
        }
    }
}

/* ======================
   START SERVER
====================== */

server.listen(3000, () => {
    console.log("SERVER ONLINE");
});
