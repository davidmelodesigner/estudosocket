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

app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        // =========================
        // CONNECT
        // =========================
        if (data.message == "sendconnect") {

            ws.playerid = data.playerid;

            connections[data.playerid] = ws;
            players[data.playerid] = data;

            // avisa todos
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        message: "playerjoin",
                        playerid: data.playerid
                    }));
                }
            });

            return;
        }

        // =========================
        // UPDATE
        // =========================
        if (data.message == "playerupdate") {

            connections[data.playerid] = ws;
            players[data.playerid] = data;

            // usa seu playerupdate original
            playerupdate(wss, ws, data, connections);

            return;
        }

        // =========================
        // GET USERS
        // =========================
        if (data.message == "getallusers") {

            broadcastusers(wss, ws, data, connections);

            return;
        }
    });

    ws.on("close", () => {

        const id = ws.playerid;

        if (!id) return;

        delete connections[id];
        delete players[id];

        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    message: "playerleave",
                    playerid: id
                }));
            }
        });

    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
