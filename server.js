const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const homepage = require("./home.js");
const createUser = require("./createuser.js");

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
const playersid = [];

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

         if (data.message === "createuser") {
               createUser(ws, data.userId, wss);
                
         }

        
        
    });

    ws.on("close", () => {
        console.log("Saiu:", ws.userId);

        const index = playersid.indexOf(ws.userId);

        if (index !== -1) {
            playersid.splice(index, 1);
        }

        delete players[ws.userId];
    });
});


// -------------------------
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
