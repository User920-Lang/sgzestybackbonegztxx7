require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');

const tournamentRoutes = require('./routes/tournaments');
const playerRoutes = require('./routes/players');
const uiRoutes = require('./routes/ui');
const { handleConnection } = require('./ws/wsHandler');
const { TournamentManager } = require('./managers/TournamentManager');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const DASHBOARD_PASSWORD = "78*18^_A=2q+¨ba";

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'ZestyBackboneGztxx7'
    });
});

app.get('/dashboard/token', (req, res) => {
    res.json({
        token: process.env.API_TOKEN || ''
    });
});

app.get('/dashboard', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dashboard Login</title>

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    background:#111;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    font-family:Arial;
}

.box{
    width:360px;
    background:#1b1b1b;
    padding:30px;
    border-radius:12px;
}

h2{
    color:white;
    text-align:center;
    margin-bottom:20px;
}

input{
    width:100%;
    padding:12px;
    border:none;
    border-radius:8px;
    background:#2b2b2b;
    color:white;
    font-size:15px;
}

button{
    width:100%;
    margin-top:15px;
    padding:12px;
    border:none;
    border-radius:8px;
    background:#2d89ff;
    color:white;
    font-size:15px;
    cursor:pointer;
}

button:hover{
    background:#1b6fe0;
}

#error{
    color:#ff5555;
    text-align:center;
    margin-top:15px;
}
</style>

</head>

<body>

<div class="box">

<h2>Dashboard Login</h2>

<input
id="password"
type="password"
placeholder="Password"
onkeydown="if(event.key==='Enter')login()">

<button onclick="login()">Login</button>

<div id="error"></div>

</div>

<script>

function login(){

    const password=document.getElementById("password").value;

    if(password==="78*18^_A=2q+¨ba"){
        window.location="/dashboard/home";
    }else{
        document.getElementById("error").innerHTML="Wrong password!";
    }

}

</script>

</body>
</html>
`);
});

app.use('/dashboard/home', uiRoutes);

app.use(authMiddleware);

app.use('/api/tournaments', tournamentRoutes);
app.use('/api/players', playerRoutes);

wss.on('connection', (ws, req) => handleConnection(ws, req));

TournamentManager.init();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`[PastBackboneGztxx7] Rodando na porta ${PORT}`);
    console.log(`[PastBackboneGztxx7] Dashboard: http://localhost:${PORT}/dashboard`);
});

module.exports = { app, server };
