const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('postgre'),
    ssl: {
        rejectUnauthorized: false
    }
});

async function logoutUser(ws, userid) {
   ws.send(JSON.stringify({
            message: "userlogout",
            userid:userid
        }));
}

module.exports = logoutUser;
