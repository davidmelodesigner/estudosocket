const { Pool } = require("pg");
const evenconfig = require("./config.js");

const pool = new Pool({
    connectionString: evenconfig('postgre'),
    ssl: {
        rejectUnauthorized: false
    }
});

async function logoutUser(ws, userid) {
   try {

        if (!userid) {
            console.log("Logout sem userid");
            return { success: false };
        }

        // 1. verifica se usuário existe
        const result = await pool.query(
            "SELECT id FROM usersplayers WHERE nome = $1 LIMIT 1",
            [userid]
        );

        if (result.rows.length === 0) {
            console.log("Usuário não encontrado:", userid);
            return { success: false };
        }

        // 2. deleta usuário do banco
        await pool.query(
            "DELETE FROM usersplayers WHERE nome = $1",
            [userid]
        );

        console.log("USER DELETADO:", userid);

        // 3. responde pro cliente
        ws.send(JSON.stringify({
            message: "userlogout",
            userid: userid
        }));

        return { success: true };

    } catch (err) {
        console.log("LOGOUT ERROR:", err);

        ws.send(JSON.stringify({
            message: "errorserver"
        }));

        return { success: false };
    }
}

module.exports = logoutUser;
