const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('payload'),
    ssl: {
        rejectUnauthorized: false
    }
});
module.exports = function createUser(ws, userid, wss)  {
     const payload = JSON.stringify({
        message: "userlogued",
        userid: userid
    });
    ws.send(payload);
};
