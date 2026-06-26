const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const homepage = require("./home.js");

const app = express();

app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

function createId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function resolveId(id) {

    if (!players[id]) return id;

    let i = 1;
    let newId = id + "_" + i;

    while (players[newId]) {
        i++;
        newId = id + "_" + i;
    }

    return newId;
}

wss.on("connection", (ws) => {

    ws.userId = null;

    ws.on("message", (msg) => {

        let data;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            return;
        }

        if (data.message === "startserver") {

            let id = resolveId(data.id || createId());

            ws.userId = id;

            players[id] = {
                id,
                x: 0,
                y: 0,
                z: 0,
                rx: 0,
                ry: 0,
                rz: 0,
                powerpich: 0.4,
                lastSeen: Date.now()
            };

            ws.send(JSON.stringify({
                message: "connected",
                id
            }));

            return;
        }

        if (data.message === "updateplayer") {

            const p = players[ws.userId];
            if (!p) return;

            p.x = data.x;
            p.y = data.y;
            p.z = data.z;

            p.rx = data.rx;
            p.ry = data.ry;
            p.rz = data.rz;

            p.powerpich = data.powerpich;
            p.lastSeen = Date.now();
        }
    });

    ws.on("close", () => {

        const id = ws.userId;
        if (!id) return;

        delete players[id];

        const remove = JSON.stringify({
            message: "remove",
            id
        });

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(remove);
            }
        });
    });
});

setInterval(() => {

    wss.clients.forEach(client => {

        if (client.readyState !== WebSocket.OPEN) return;

        const myId = client.userId;

        client.send(JSON.stringify({
            message: "snapshot",
            players: Object.values(players).filter(p => p.id !== myId)
        }));
    });

}, 50);

server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
