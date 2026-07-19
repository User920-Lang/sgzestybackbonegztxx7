require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');
const session = require('express-session');

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

app.use(session({
    secret: '78*18^_A=2q+¨b!*8b2ui1*(*(f32iu92))kda',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
}));

const DASHBOARD_PASSWORD = '78*18^_A=2q+¨b!*8b2ui1*(*(f32iu92))kda';

app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'PastBackboneGztxx7' });
});

app.get('/dashboard', (req, res) => {
    if (req.session.dashboardAuth) {
        return res.redirect('/dashboard');
    }

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dashboard Login</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
    background:#111;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    font-family:Arial,sans-serif;
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
button:hover{background:#1b6fe0;}
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
        autocomplete="off"
        spellcheck="false"
        onkeydown="if(event.key==='Enter')login()"
    >

    <button onclick="login()">Login</button>
    <div id="error"></div>
</div>

<script>
window.onload = () => {
    const input = document.getElementById("password");
    input.value = "";
    input.focus();
};

async function login() {
    const password = document.getElementById("password").value;

    const response = await fetch("/dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    if (response.ok) {
        window.location.href = "/dashboard";
    } else {
        document.getElementById("error").textContent = "Wrong password!";
    }
}
</script>

</body>
</html>
`);
});

app.post('/dashboard/login', (req, res) => {
    const { password } = req.body;

    if (password === DASHBOARD_PASSWORD) {
        req.session.dashboardAuth = true;
        return res.json({ success: true });
    }

    res.status(401).json({ success: false, message: 'Wrong password' });
});

app.get('/dashboard/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/dashboard');
    });
});

app.use('/dashboard/home', (req, res, next) => {
    if (req.session.dashboardAuth) {
        return next();
    }
    res.redirect('/dashboard');
});

app.use('/dashboard', uiRoutes);

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
