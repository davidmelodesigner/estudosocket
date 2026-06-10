const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const callconfigs = require("./config");
const homepage = require("./app/home.js");
const startserver = require("./app/startserver.js");

const app = express();


app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        if(data.message=="sendconnect"){
            startserver(ws,data);
        } 
        

        
    });

    

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
