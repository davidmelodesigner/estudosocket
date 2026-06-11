const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};
const connections = {};

function clearAll() {

    wss.clients.forEach((ws) => {
        try {
            ws.terminate();
        } catch (e) {}
    });

    for (const id in players) {
        delete players[id];
    }

    for (const id in connections) {
        delete connections[id];
    }

    console.log("CLEAN SERVER RESETADO");
}

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.message === "clear") {
            clearAll();
        }

        if (data.message === "ping") {
            ws.send(JSON.stringify({ message: "pong" }));
        }
    });

    ws.on("close", () => {});
});

server.listen(3000, () => {
    console.log("CLEAN SERVER ONLINE");
});
