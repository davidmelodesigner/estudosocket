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

async function getUser(ws, userid, wss) {

    try {
        const result = await pool.query(
            "SELECT id, nome FROM usersplayers WHERE id = $1 LIMIT 1",
            [userid]
        );

        let payload;

        if (result.rows.length === 0) {

            payload = JSON.stringify({
                message: "notgetuser"
            });

        } else {

            const userobj = {
                id: result.rows[0].id,
                nome: result.rows[0].nome
            };

            payload = JSON.stringify({
                message: "getuser",
                userdata: userobj
            });
        }

        ws.send(payload);

    } catch (err) {
        console.log(err);

        ws.send(JSON.stringify({
            message: "errorserver"
        }));
    }
}

module.exports = {
    getallusers,
    getUser
};
