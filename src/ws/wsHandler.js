const { TournamentManager } = require('../managers/TournamentManager');
const { wsAuth } = require('../middleware/auth');

const clients = new Map(); // playerId -> ws

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const ws of clients.values()) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

function sendTo(playerId, data) {
  const ws = clients.get(playerId);
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(data));
}

function handleConnection(ws, req) {
  let playerId = null;
  console.log(`[WS] New connection`);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    const { type, payload } = msg;

    switch (type) {

      // Client identifies itself
      case 'AUTH': {
        if (!wsAuth(payload.token)) {
          ws.send(JSON.stringify({ type: 'AUTH_FAIL', payload: { error: 'Invalid token' } }));
          ws.close();
          return;
        }
        playerId = payload.playerId;
        clients.set(playerId, ws);
        ws.send(JSON.stringify({ type: 'AUTH_OK', payload: { playerId } }));
        console.log(`[WS] Player authenticated: ${playerId}`);

        // Send current tournament list immediately
        ws.send(JSON.stringify({
          type: 'TOURNAMENT_LIST',
          payload: { tournaments: TournamentManager.getAll() },
        }));
        break;
      }

      // Client requests tournament list
      case 'GET_TOURNAMENTS': {
        ws.send(JSON.stringify({
          type: 'TOURNAMENT_LIST',
          payload: { tournaments: TournamentManager.getAll() },
        }));
        break;
      }

      // Client registers for a tournament
      case 'REGISTER': {
        const { tournamentId, playerName } = payload;
        const result = TournamentManager.register(tournamentId, playerId, playerName);
        ws.send(JSON.stringify({ type: 'REGISTER_RESULT', payload: result }));

        if (result.success) {
          // Notify everyone that a new player joined
          broadcast({
            type: 'TOURNAMENT_UPDATE',
            payload: { tournament: result.tournament },
          });
        }
        break;
      }

      // Admin/client reports match result
      case 'REPORT_RESULT': {
        const { tournamentId, matchId, winnerId } = payload;
        const result = TournamentManager.reportResult(tournamentId, matchId, winnerId);
        if (result.error) {
          ws.send(JSON.stringify({ type: 'ERROR', payload: result }));
        } else {
          broadcast({
            type: 'BRACKET_UPDATE',
            payload: { bracket: result.bracket, match: result.match },
          });

          if (result.bracket.finished) {
            broadcast({
              type: 'TOURNAMENT_FINISHED',
              payload: {
                tournamentId,
                winnerId: result.bracket.winnerId,
              },
            });
          }
        }
        break;
      }

      // Ping/keepalive
      case 'PING': {
        ws.send(JSON.stringify({ type: 'PONG' }));
        break;
      }

      default:
        ws.send(JSON.stringify({ type: 'ERROR', payload: { error: `Unknown type: ${type}` } }));
    }
  });

  ws.on('close', () => {
    if (playerId) {
      clients.delete(playerId);
      console.log(`[WS] Player disconnected: ${playerId}`);
    }
  });

  ws.on('error', (err) => {
    console.error(`[WS] Error:`, err.message);
  });
}

module.exports = { handleConnection, broadcast, sendTo };
