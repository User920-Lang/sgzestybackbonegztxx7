const express = require('express');
const router = express.Router();
const { TournamentManager } = require('../managers/TournamentManager');

router.get('/', (req, res) => {
  const list = TournamentManager.getAll();
  res.json({ tournaments: list, count: list.length });
});

router.get('/config', (req, res) => {
  res.json(TournamentManager.loadConfig());
});

router.patch('/config', (req, res) => {
  const config = TournamentManager.updateConfig(req.body);
  res.json({ success: true, config });
});

router.get('/:id', (req, res) => {
  const t = TournamentManager.getById(req.params.id);
  if (!t) return res.status(404).json({ error: 'Tournament not found' });
  res.json(t);
});

router.post('/', (req, res) => {
  const { tournamentName } = req.body;
  if (!tournamentName) return res.status(400).json({ error: 'tournamentName required' });
  const t = TournamentManager.create(req.body);
  res.status(201).json(t);
});

router.post('/:id/reset', (req, res) => {
  const t = TournamentManager.getById(req.params.id);
  if (!t) return res.status(404).json({ error: 'Tournament not found' });
  t.participants = [];
  t.status = 1; // back to REGISTRATION
  TournamentManager.brackets.delete(Number(req.params.id));
  res.json({ success: true });
});

router.post('/:id/cancel', (req, res) => {
  const result = TournamentManager.cancel(req.params.id);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

router.post('/:id/register', (req, res) => {
  const { playerId, playerName, gems } = req.body;
  if (!playerId || !playerName) return res.status(400).json({ error: 'playerId and playerName required' });
  const result = TournamentManager.register(req.params.id, playerId, playerName, gems || 0);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

router.get('/:id/bracket', (req, res) => {
  const bracket = TournamentManager.getBracket(req.params.id);
  if (!bracket) return res.status(404).json({ error: 'Bracket not found' });
  res.json(bracket);
});

router.post('/:id/bracket/result', (req, res) => {
  const { matchId, winnerId } = req.body;
  if (!matchId || !winnerId) return res.status(400).json({ error: 'matchId and winnerId required' });
  const result = TournamentManager.reportResult(req.params.id, matchId, winnerId);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

module.exports = router;
