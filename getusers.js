const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('postgre'),
    ssl: {
        rejectUnauthorized: false
    }
});

function getallusers(ws, data, wss, players) {

    const payload = JSON.stringify({
        message: "receiveusers",
        users: players
    });

    wss.clients.forEach(client => {

        if (client.readyState === 1) {
            client.send(payload);
        }

    });
}

function getUser(ws, userid, wss) {

    const result = await pool.query(
            "SELECT id FROM usersplayers WHERE id = $1 LIMIT 1",
            [userid]
        );

        if (result.rows.length === 0) {
            const payload = JSON.stringify({
                message: "notgetuser",
            });
        }else{
            userobj = {
                message: "getuser",
                id: insert.rows[0].id,
                nome: insert.rows[0].nome
            };
            const payload = JSON.stringify(userobj);
        }
    
    

    ws.send(payload);
}

module.exports = {
    getallusers,
    getUser
};
