require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const tournamentRoutes = require('./routes/tournaments');
const playerRoutes = require('./routes/players');
const uiRoutes = require('./routes/ui');
const { handleConnection } = require('./ws/wsHandler');
const { TournamentManager } = require('./managers/TournamentManager');
const { authMiddleware } = require('./middleware/auth');
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const ACESS_PASSWORD = process.env.DASHBOARD_PASSWORD || "&Zi1*He5?Ns8!Vq2@Jc7#Tl4$Bx9%Rf3^Wp6&Md1*Ky5?Og8!Ua2@Zn7#Eh4$Cs9%Tv3^Lj6&Qr1*Fp5?Xm8!Bd2@Kw7#Ny4$Hg9%Ro3^Ve6&Ta1*Jz5?Cu8!Ls2@Df7#Qx4$Pm9%Wi3^Ak6&Yn1*";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('seu_segredo_aqui')); 
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Login - Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f4f9; margin: 0; }
                .login-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 320px; text-align: center; }
                input[type="password"] { width: 100%; padding: 10px; margin: 15px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
                button:hover { background: #0056b3; }
                .error { color: red; margin-bottom: 10px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h2>Acesso Restrito</h2>
                ${req.query.error ? '<div class="error">Senha incorreta!</div>' : ''}
                <form action="/login" method="POST">
                    <input type="password" name="password" placeholder="Digite a senha mestre" required autocomplete="off">
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </body>
        </html>
    `);
});
app.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === ACESS_PASSWORD) {
        res.cookie('auth_session', 'authenticated', { 
            httpOnly: true, 
            secure: false,
            sameSite: 'strict' 
        });
        return res.redirect('/dashboard');
    } else {
        return res.redirect('/login?error=true');
    }
});
app.get('/logout', (req, res) => {
    res.clearCookie('auth_session');
    res.redirect('/login');
});
const checkDashboardAuth = (req, res, next) => {
    if (req.cookies.auth_session === 'authenticated') {
        return next();
    }
    res.redirect('/login');
};
app.get('/health', (req, res) => res.json({ status: 'ok', server: 'ZestyBackboneGztxx7' }));
app.get('/dashboard/token', checkDashboardAuth, (req, res) => res.json({ token: process.env.API_TOKEN || '' }));
app.use('/dashboard', checkDashboardAuth, uiRoutes);
app.use('/api/tournaments', authMiddleware, tournamentRoutes);
app.use('/api/players', authMiddleware, playerRoutes);

wss.on('connection', (ws, req) => handleConnection(ws, req));

TournamentManager.init();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[PastBackboneGztxx7] Rodando na porta ${PORT}`);
  console.log(`[PastBackboneGztxx7] Dashboard: http://localhost:${PORT}/dashboard`);
});

module.exports = { app, server };
