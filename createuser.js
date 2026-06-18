const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('payload'),
    ssl: {
        rejectUnauthorized: false
    }
});
module.exports = function createUser(ws, data, wss)  {

    const userId = data.userId;

     const payload = JSON.stringify({
        message: "userlogued",
        userid: userId
    });
    ws.send(payload);
};
