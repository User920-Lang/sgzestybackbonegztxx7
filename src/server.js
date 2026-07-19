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
app.use(cookieParser('secret_token_key'));

app.get('/login', (req, res) => {
    const errorMessage = req.query.error ? '<div class="error">Senha incorreta. Tente novamente.</div>' : '';
    
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login - Dashboard</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                body { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f8fafc; }
                .login-container { background: rgba(30, 41, 59, 0.7); padding: 40px 30px; border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; max-width: 400px; text-align: center; }
                h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #fff; }
                p { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
                input[type="password"] { width: 100%; padding: 12px 16px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px; color: #fff; font-size: 16px; transition: all 0.3s ease; outline: none; margin-bottom: 20px; text-align: center; }
                input[type="password"]:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2); }
                button { width: 100%; padding: 12px; background: #0284c7; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: background 0.2s ease; }
                button:hover { background: #0369a1; }
                .error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 10px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h2>Acesso Restrito</h2>
                <p>Insira a chave mestre para acessar o painel</p>
                ${errorMessage}
                <form action="/login" method="POST">
                    <input type="password" name="password" placeholder="••••••••••••" required autocomplete="off">
                    <button type="submit">Entrar no Dashboard</button>
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
  console.log(`[PastBackboneGztxx7] Rodando na porta \${PORT}`);
  console.log(`[PastBackboneGztxx7] Dashboard: http://localhost:\${PORT}/dashboard`);
});

module.exports = { app, server };
