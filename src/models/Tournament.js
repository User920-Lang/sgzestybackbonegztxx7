const { getMap } = require('../maps');

const TournamentStatus = { UPCOMING:0, REGISTRATION:1, IN_PROGRESS:2, FINISHED:3, CANCELLED:4, ACTIVE:6 };
const TournamentType   = { TESTING:'TestingTournament', CLASSIC:'ClassicTournament', RANKED:'RankedTournament' };
const PhaseType        = { SINGLE_ELIMINATION:'SingleEliminationBracket', ROUND_ROBIN:'RoundRobin' };
const UserStatus       = { NONE:0, INVITED:1, REGISTERED:2, ELIMINATED:3, WINNER:4 };

function createRound(id, maxLength = 30, winScore = 1) {
  return { id, maxLength, winScore };
}

function createPhase(overrides = {}) {
  return {
    id: 1,
    type: PhaseType.SINGLE_ELIMINATION,
    maxLoses: 1,
    maxTeams: 128,
    maxPlayers: 2,
    rounds: overrides.rounds || [1,2,3,4,5].map(i => createRound(i)),
    ...overrides,
  };
}

function createTournament(overrides = {}) {
  const now        = new Date();
  const startTime  = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const roundCount = parseInt(overrides.roundCount) || 5;
  const rounds     = Array.from({ length: roundCount }, (_, i) => createRound(i + 1));
  const mapName    = overrides.map || 'block dash';
  const mapData    = getMap(mapName) || { name: mapName, id: 'level1_tile' };

  return {
    id:                  overrides.id || Date.now(),
    tournamentName:      overrides.tournamentName || 'Stumble Zesty 1v1',
    description:         overrides.description || '',
    additionalDescription: '',
    imageUrl:            overrides.imageUrl || 'https://cdn.discordapp.com/attachments/1493765303501590639/1526973833007992973/Polish_20260705_175701784.jpg?ex=6a5c4473&is=6a5af2f3&hm=5fe51d6cefb301c9a1713568292c6b02211732b12ea9568e775de4e08ecc1384&',
    iconUrl:             overrides.iconUrl || 'https://cdn.discordapp.com/attachments/1493765303501590639/1526973833007992973/Polish_20260705_175701784.jpg?ex=6a5c4473&is=6a5af2f3&hm=5fe51d6cefb301c9a1713568292c6b02211732b12ea9568e775de4e08ecc1384&',
    sponsorImageUrl:     overrides.sponsorImageUrl || '',
    themeColor:          overrides.themeColor || '#00800',
    status:              TournamentStatus.REGISTRATION,
    type:                TournamentType.CLASSIC,
    time:                startTime.toISOString(),
    currentPhaseId:      1,
    phaseCount:          1,
    partySize:           1,
    map:                 mapData.name,
    mapId:               mapData.id,
    roundCount,
    gemCost:             parseInt(overrides.gemCost) || 0,
    prizePool:           overrides.prizePool || {
      1: 500,
      2: 250,
      3: 150,
      4: 100,
      5: 50,
    },
    phases:              [createPhase({ rounds })],
    winner:              null,
    invite:              { status: UserStatus.INVITED, finalPlace: 0 },
    hasAllDataLoaded:    true,
    participants:        [],
    createdAt:           now.toISOString(),
  };
}

module.exports = { createTournament, createPhase, createRound, TournamentStatus, TournamentType, PhaseType, UserStatus };
