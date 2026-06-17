module.exports = function homepage(req, res) {

    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Nosso Game</title>

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial, sans-serif;
}

body{
    background:#0f172a;
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    overflow:hidden;
}

.container{
    text-align:center;
    max-width:800px;
    padding:40px;
}

h1{
    font-size:4rem;
    margin-bottom:20px;
    animation:pulse 2s infinite;
}

p{
    font-size:1.2rem;
    color:#cbd5e1;
    margin-bottom:30px;
}

.card{
    background:rgba(255,255,255,0.08);
    padding:25px;
    border-radius:15px;
    backdrop-filter:blur(8px);
}

.status{
    margin-top:20px;
    font-weight:bold;
    color:#22c55e;
}

button{
    margin-top:20px;
    padding:12px 25px;
    border:none;
    border-radius:8px;
    cursor:pointer;
    font-size:16px;
    transition:0.3s;
}

button:hover{
    transform:scale(1.05);
}

@keyframes pulse{
    0%{transform:scale(1);}
    50%{transform:scale(1.03);}
    100%{transform:scale(1);}
}
</style>

</head>

<body>

<div class="container">

<h1>🎮 Nosso Game</h1>

<div class="card">
    <p>
        Bem-vindo ao portal oficial do nosso projeto.
    </p>

    <p>
        Estamos desenvolvendo uma nova experiência multiplayer.
        O jogo ainda está em produção e novas funcionalidades
        estão sendo implementadas diariamente.
    </p>

    <div class="status">
        🚀 Lançamento em breve
    </div>

    <button onclick="showMessage()">
        Acompanhar Desenvolvimento
    </button>

    <p id="msg" style="margin-top:20px;"></p>
</div>

</div>

<script>
function showMessage(){
    document.getElementById("msg").innerHTML =
        "Obrigado pelo interesse! Em breve teremos novidades sobre o lançamento.";
}
</script>

</body>
</html>
    `);

};
