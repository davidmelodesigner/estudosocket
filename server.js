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

        if (data.message == "sendconnect") {

            const id = data.playerid;

            if (!id) return;

            if (connections[id] && connections[id] !== ws) {
                connections[id].terminate();
                delete players[id];
                delete connections[id];
            }

            ws.playerid = id;
            connections[id] = ws;

            players[id] = {
                playerid: id
            };

            // avisa OUTROS players (não inclui o próprio)
            wss.clients.forEach(client => {
                if (client.readyState === 1 && client !== ws) {
                    client.send(JSON.stringify({
                        message: "playerjoin",
                        playerid: id
                    }));
                }
            });

            startserver(ws, data, connections, players);
        }

        if (data.message == "playerupdate") {
            playerupdate(wss, ws, data, connections);
        }

        if (data.message == "getallusers") {
            broadcastusers(wss, ws, data, connections);
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
