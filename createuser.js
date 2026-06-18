const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('postgre'),
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async function createUser(ws, data, wss) {
    try{
    ws.send(JSON.stringify({
                message: "userlogued",
            }));

        

    } catch (err) {

        console.log("POSTGRES ERROR:", err);

        ws.send(JSON.stringify({
            message: "errorserver"
        }));

    }
};
