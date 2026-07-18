const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory player store (swap for DB later)
const players = new Map();

// POST /api/players/login — simple auth
router.post('/login', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  let player = Array.from(players.values()).find(p => p.name === name);
  if (!player) {
    player = { id: uuidv4(), name, createdAt: new Date().toISOString(), wins: 0, losses: 0 };
    players.set(player.id, player);
  }

  res.json({ player, token: Buffer.from(player.id).toString('base64') });
});

// GET /api/players/:id
router.get('/:id', (req, res) => {
  const p = players.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Player not found' });
  res.json(p);
});

// GET /api/players — list all
router.get('/', (req, res) => {
  res.json({ players: Array.from(players.values()), count: players.size });
});

module.exports = router;
