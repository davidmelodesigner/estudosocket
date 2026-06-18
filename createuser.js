
module.exports = function createUser(ws, data, wss)  {

    const userId = data.userId;

     const payload = JSON.stringify({
        message: "userlogued",
        userid: userId
    });
};
