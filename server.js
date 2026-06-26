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

wss.on("connection", (ws) => {

    console.log("CLIENT CONNECTED");

    // avisa o cliente que conectou
    ws.send(JSON.stringify({
        message: "connected"
    }));

    ws.on("message", (msg) => {

        let data;

        try {
            data = JSON.parse(msg.toString());
        } catch (e) {
            console.log("JSON INVALID");
            return;
        }

        console.log("RECEIVED:", data);

        if (data.message === "test") {

            ws.send(JSON.stringify({
                message: "echo",
                text: data.text
            }));

        }

    });

    ws.on("close", () => {
        console.log("CLIENT DISCONNECTED");
    });

    ws.on("error", (err) => {
        console.log(err);
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
