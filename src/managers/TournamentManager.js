const fs = require('fs');
const path = require('path');
const { createTournament } = require('../models/Tournament');

const CONFIG_PATH = path.join(__dirname, '../../tournament.config.json');

const DEFAULT_CONFIG = {
  id: 10,
  tournamentName: 'Stumble Zesty 1v1',
  description: '',
  themeColor: '#008000',
  imageUrl: 'https://cdn.discordapp.com/attachments/1493765303501590639/1526973833007992973/Polish_20260705_175701784.jpg?ex=6a5c4473&is=6a5af2f3&hm=5fe51d6cefb301c9a1713568292c6b02211732b12ea9568e775de4e08ecc1384&',
  iconUrl: 'https://cdn.discordapp.com/attachments/1493765303501590639/1526973833007992973/Polish_20260705_175701784.jpg?ex=6a5c4473&is=6a5af2f3&hm=5fe51d6cefb301c9a1713568292c6b02211732b12ea9568e775de4e08ecc1384&',
  sponsorImageUrl: '',
  map: 'block dash',
  roundCount: 5,
  gemCost: 10,
};

class TournamentManagerClass {
  constructor() {
    this.tournaments = new Map();
    this.brackets = new Map();
  }

  loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
      try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')); }
      catch { console.warn('[TournamentManager] Invalid config, using default'); }
    }
    return { ...DEFAULT_CONFIG };
  }

  saveConfig(data) {
    const allowed = ['tournamentName', 'description', 'themeColor', 'imageUrl', 'iconUrl', 'sponsorImageUrl', 'map', 'roundCount', 'gemCost'];
    const current = this.loadConfig();
    for (const key of allowed)
      if (data[key] !== undefined) current[key] = data[key];
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(current, null, 2));
    return current;
  }

  init() {
    const config = this.loadConfig();
    const t = createTournament(config);
    this.tournaments.set(t.id, t);
    console.log(`[TournamentManager] Tournament started: "${t.tournamentName}" (id=${t.id})`);
  }

  updateConfig(data) {
    const config = this.saveConfig(data);
    const t = this.tournaments.get(10);
    if (t) Object.assign(t, config);
    return config;
  }

  getAll() { return Array.from(this.tournaments.values()); }

  getById(id) { return this.tournaments.get(Number(id)) || null; }

  create(data) {
    const t = createTournament(data);
    this.tournaments.set(t.id, t);
    this._initBracket(t);
    console.log(`[TournamentManager] Tournament created: "${t.tournamentName}" (id=${t.id})`);
    return t;
  }

  cancel(tournamentId) {
    const t = this.tournaments.get(Number(tournamentId));
    if (!t) return { error: 'Tournament not found' };
    t.status = 4; // CANCELLED
    console.log(`[TournamentManager] Tournament cancelled: ${tournamentId}`);
    return { success: true };
  }

  register(tournamentId, playerId, playerName, gems = 0) {
    const t = this.tournaments.get(Number(tournamentId));
    if (!t) return { error: 'Tournament not found' };
    if (t.status === 4) return { error: 'Tournament cancelled' };
    if (t.participants.find(p => p.id === playerId)) return { error: 'Already registered' };
    if (t.participants.length >= 128) return { error: 'Tournament full' };
    if (t.gemCost > 0 && gems < t.gemCost) return { error: `Need ${t.gemCost} gems to register` };

    t.participants.push({ id: playerId, name: playerName, registeredAt: new Date().toISOString() });
    if (t.participants.length >= 2) this._buildBracket(t);
    console.log(`[TournamentManager] Player ${playerName} registered to tournament ${tournamentId}`);
    return { success: true, tournament: t };
  }

  reportResult(tournamentId, matchId, winnerId) {
    const bracket = this.brackets.get(Number(tournamentId));
    if (!bracket) return { error: 'Bracket not found' };
    const match = bracket.matches.find(m => m.id === matchId);
    if (!match) return { error: 'Match not found' };
    if (match.winnerId) return { error: 'Match already resolved' };
    match.winnerId = winnerId;
    match.status = 'finished';
    match.finishedAt = new Date().toISOString();
    this._advanceBracket(tournamentId, bracket);
    return { success: true, match, bracket };
  }

  getBracket(tournamentId) { return this.brackets.get(Number(tournamentId)) || null; }

  _initBracket(tournament) {
    this.brackets.set(tournament.id, { tournamentId: tournament.id, matches: [], round: 1, finished: false, winnerId: null });
  }

  _buildBracket(tournament) {
    const participants = [...tournament.participants].sort(() => Math.random() - 0.5);
    const matches = [];
    let matchId = 1;
    for (let i = 0; i < participants.length - 1; i += 2)
      matches.push({ id: matchId++, round: 1, player1: participants[i], player2: participants[i + 1] || null, winnerId: null, status: 'pending' });
    const bracket = this.brackets.get(tournament.id) || {};
    Object.assign(bracket, { tournamentId: tournament.id, matches, round: 1, finished: false });
    this.brackets.set(tournament.id, bracket);
    tournament.status = 2; // IN_PROGRESS
    console.log(`[TournamentManager] Bracket built for tournament ${tournament.id}`);
  }

  _advanceBracket(tournamentId, bracket) {
    const pending = bracket.matches.filter(m => m.round === bracket.round && !m.winnerId);
    if (pending.length > 0) return;
    const winners = bracket.matches
      .filter(m => m.round === bracket.round)
      .map(m => [m.player1, m.player2].filter(Boolean).find(p => p.id === m.winnerId) || m.player1);
    if (winners.length === 1) {
      bracket.finished = true;
      bracket.winnerId = winners[0].id;
      const t = this.tournaments.get(Number(tournamentId));
      if (t) { t.status = 3; t.winner = winners[0]; }
      console.log(`[TournamentManager] Tournament ${tournamentId} finished. Winner: ${winners[0].name}`);
      return;
    }
    bracket.round++;
    let matchId = bracket.matches.length + 1;
    for (let i = 0; i < winners.length - 1; i += 2)
      bracket.matches.push({ id: matchId++, round: bracket.round, player1: winners[i], player2: winners[i + 1] || null, winnerId: null, status: 'pending' });
  }
}

const TournamentManager = new TournamentManagerClass();
module.exports = { TournamentManager };
