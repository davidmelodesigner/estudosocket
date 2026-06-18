const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('postgre'),
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async function createUser(ws, data, wss) {

    try {

        const result = await pool.query(
            "SELECT id, nome FROM usersplayers WHERE nome = $1 LIMIT 1",
            [data.userId]
        );

        if (result.rows.length === 0) {

            ws.send(JSON.stringify({
                message: "loginfailed"
            }));

            return;
        }

        const userobj = result.rows[0];

        ws.send(JSON.stringify({
            message: "userlogued",
            userid: userobj.nome
        }));

        return {
            success: true,
            userdata: userobj
        };

    } catch (err) {

        console.log("POSTGRES ERROR:", err);

        ws.send(JSON.stringify({
            message: "errorserver"
        }));

        return {
            success: false
        };
    }
};
