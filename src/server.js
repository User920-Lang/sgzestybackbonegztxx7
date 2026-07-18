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

app.get('/health', (req, res) => res.json({ status: 'ok', server: 'PastBackboneGztxx7' }));
app.get('/dashboard/token', (req, res) => res.json({ token: process.env.API_TOKEN || '' }));
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
