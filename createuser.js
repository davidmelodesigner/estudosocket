const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('postgre'),
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = function createUser(ws, data, wss)  {

    const userId = data.userid;

     const payload = JSON.stringify({
        message: "userlogued",
        userid: userId
    });
};
