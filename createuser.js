const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('payload'),
    ssl: {
        rejectUnauthorized: false
    }
});

async function createUser(ws, userid) {
    try {

        // 1. procura usuário
        const result = await pool.query(
            "SELECT id, nome FROM users WHERE nome = $1 LIMIT 1",
            [userid]
        );

        let userobj;

        // 2. se não existe, cria
        if (result.rows.length === 0) {

            const insert = await pool.query(
                "INSERT INTO users (nome) VALUES ($1) RETURNING id, nome",
                [userid]
            );

            userobj = {
                id: insert.rows[0].id,
                nome: insert.rows[0].nome
            };

        } else {

            userobj = {
                id: result.rows[0].id,
                nome: result.rows[0].nome
            };
        }

        // 3. envia APENAS UMA VEZ
        ws.send(JSON.stringify({
            message: "userlogued",
            userdata: userobj
        }));

        console.log("USERLOGUED:", userobj);

        return { success: true, userdata: userobj };

    } catch (err) {
        console.log(err);

        ws.send(JSON.stringify({
            message: "errorserver"
        }));

        return { success: false };
    }
}

module.exports = createUser;
