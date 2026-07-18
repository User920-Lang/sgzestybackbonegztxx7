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
    tournamentName:      overrides.tournamentName || 'SGPast Tourney 1v1',
    description:         overrides.description || '',
    additionalDescription: '',
    imageUrl:            overrides.imageUrl || 'https://cdn.discordapp.com/attachments/1418030482653708329/1498871528253816964/d85dddabdc5d2e8657c1dee908a83634.png?ex=6a282124&is=6a26cfa4&hm=c5c9520bba403c50cfa5873f39250cee357021516ff7c2f871fb8601dd37a507&',
    iconUrl:             overrides.iconUrl || 'https://cdn.discordapp.com/attachments/1418030482653708329/1498871528253816964/d85dddabdc5d2e8657c1dee908a83634.png?ex=6a282124&is=6a26cfa4&hm=c5c9520bba403c50cfa5873f39250cee357021516ff7c2f871fb8601dd37a507&',
    sponsorImageUrl:     overrides.sponsorImageUrl || '',
    themeColor:          overrides.themeColor || '#0062ff',
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
