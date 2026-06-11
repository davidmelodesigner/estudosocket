const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {

        const data = JSON.parse(msg);

        const id = data.playerid;

        if (data.message === "connect") {

            ws.playerid = id;
            clients.set(id, ws);

            // avisa outros
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

function broadcast(data, ignore) {

    const msg = JSON.stringify(data);

    for (const client of wss.clients) {
        if (client.readyState === 1 && client !== ignore) {
            client.send(msg);
        }
    }
}

server.listen(3000, () => {
    console.log("SERVER OK");
});
