const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const callconfigs = require("./config");
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

        if (data.message === "sendconnect") {

            if (connections[data.playerid]) {
                connections[data.playerid].terminate();
                delete connections[data.playerid];
                delete players[data.playerid];
            }

            ws.playerid = data.playerid;

            startserver(ws, data, connections, players);
        }

        if (data.message === "playerupdate") {

            connections[data.playerid] = ws;
            players[data.playerid] = data;

            playerupdate(wss, ws, data, connections);
        }

        if (data.message === "getallusers") {
            broadcastusers(wss, ws, data, connections);
        }

    });

    ws.on("close", () => {

        const id = ws.playerid;

        if (!id) return;

        delete connections[id];
        delete players[id];

        console.log("REMOVED:", id);
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
