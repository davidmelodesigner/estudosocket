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

// -------------------------
// CONNECTION
// -------------------------
wss.on("connection", (ws) => {

    randomnum = Math.random().toString(36).substr(2, 9);
    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());
        ws.userId=data.nameId+randomnum

        if(data.message=="startserver"){
            
            players[ws.userId] = {
                id: ws.userId,
                x: 0, y: 0, z: 0,
                rx: 0, ry: 0, rz: 0,
                lastSeen: Date.now()
            };
            ws.send(JSON.stringify({
                    message: "connected",
                    player: players[ws.userId]
                }));
        }
        if (data.message === "updateplayer") {
            
                const id = data.userId; // vindo do client
            
                // segurança básica: só aceita se existir
                if (!players[id]) return;
            
                const p = players[id];
            
                p.x = data.x;
                p.y = data.y;
                p.z = data.z;
            
                p.rx = data.rx;
                p.ry = data.ry;
                p.rz = data.rz;
            
                p.power = data.power;
            
                p.lastSeen = Date.now();
            }
       
    });

    ws.on("close", () => {
        delete players[ws.userId];
    });
});

setInterval(() => {

    const snapshot = {
        message: "snapshot",
        players: []
    };

    for (const id in players) {
        const p = players[id];

        snapshot.players.push({
            id: p.id,
            x: p.x,
            y: p.y,
            z: p.z,
            rx: p.rx,
            ry: p.ry,
            rz: p.rz,
            power: p.power || 0
        });
    }

    const data = JSON.stringify(snapshot);

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(data);
        }
    });

}, 50);


// -------------------------
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
