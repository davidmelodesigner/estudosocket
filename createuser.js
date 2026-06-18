const { Pool } = require("pg");
const crypto = require("crypto");

const callconfigs = require("./config");

const { Pool } = require("pg");
const evenconfig = require("./evenconfig.js");

const pool = new Pool({
    connectionString: evenconfig(),
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = function createUser(ws, data, wss) {

    async function loginusers(usuario, senha, ws) {
        try {
            const result = await pool.query(
                "SELECT id, nome FROM usersplayers WHERE email = $1 LIMIT 1",
                [data.userId]
            );
    
            if (result.rows.length === 0) {
                ws.send(JSON.stringify({
                    message: "loginfailed"
                }));
    
                return { success: false };
            }
    
            ws.send(JSON.stringify({
                message: "userlogued",
                userid: data.userId
            }));
    
            return {
                success: true,
                userdata: userobj
            };
    
        } catch (err) {
            console.log(err);
    
            ws.send(JSON.stringify({
                message: "errorserver"
            }));
    
            return { success: false };
        }
    }
};
