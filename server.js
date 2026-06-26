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

    console.log("CLIENTE CONECTOU");

    // avisa o cliente que conectou
    ws.send(JSON.stringify({
        message: "connected"
    }));

    ws.on("message", (msg) => {

        try {

            const data = JSON.parse(msg.toString());

            console.log("RECEBIDO:", data);

            // responde para o cliente
            ws.send(JSON.stringify({
                message: "echo",
                data: data
            }));

        } catch (err) {
            console.log("JSON INVÁLIDO");
        }

    });

    ws.on("close", () => {
        console.log("CLIENTE DESCONECTOU");
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
