// FIFA World Cup 2026 final group draw, keyed by ESPN team id.
// Abbreviations kept inline for human auditing. ESPN ids are stable; abbrs are the cross-check.
// Source of the draw: official 2026 group stage. Validated at boot (12 groups x 4 = 48).

const GROUPS = {
  A: ['203' /*MEX*/, '467' /*RSA*/, '451' /*KOR*/, '450' /*CZE*/],
  B: ['206' /*CAN*/, '475' /*SUI*/, '4398' /*QAT*/, '452' /*BIH*/],
  C: ['205' /*BRA*/, '2869' /*MAR*/, '2654' /*HAI*/, '580' /*SCO*/],
  D: ['660' /*USA*/, '210' /*PAR*/, '628' /*AUS*/, '465' /*TUR*/],
  E: ['481' /*GER*/, '11678' /*CUW*/, '4789' /*CIV*/, '209' /*ECU*/],
  F: ['449' /*NED*/, '627' /*JPN*/, '466' /*SWE*/, '659' /*TUN*/],
  G: ['459' /*BEL*/, '2620' /*EGY*/, '469' /*IRN*/, '2666' /*NZL*/],
  H: ['164' /*ESP*/, '2597' /*CPV*/, '655' /*KSA*/, '212' /*URU*/],
  I: ['478' /*FRA*/, '654' /*SEN*/, '464' /*NOR*/, '4375' /*IRQ*/],
  J: ['202' /*ARG*/, '624' /*ALG*/, '474' /*AUT*/, '2917' /*JOR*/],
  K: ['482' /*POR*/, '208' /*COL*/, '2570' /*UZB*/, '2850' /*COD*/],
  L: ['448' /*ENG*/, '477' /*CRO*/, '4469' /*GHA*/, '2659' /*PAN*/],
};

// id -> "A".."L"
const ID_TO_GROUP = {};
for (const [letter, ids] of Object.entries(GROUPS)) {
  for (const id of ids) ID_TO_GROUP[id] = letter;
}

const LETTERS = Object.keys(GROUPS);
const ALL_TEAM_IDS = new Set(Object.values(GROUPS).flat());

// Boot validation: warns loudly if the draw drifts from ESPN's roster.
function validate(espnTeamIds = []) {
  const problems = [];
  for (const [letter, ids] of Object.entries(GROUPS)) {
    if (ids.length !== 4) problems.push(`Group ${letter} has ${ids.length} teams (expected 4)`);
  }
  if (ALL_TEAM_IDS.size !== 48) problems.push(`Total mapped teams = ${ALL_TEAM_IDS.size} (expected 48)`);
  if (espnTeamIds.length) {
    const espnSet = new Set(espnTeamIds.map(String));
    for (const id of ALL_TEAM_IDS) if (!espnSet.has(id)) problems.push(`Mapped id ${id} not found in ESPN feed`);
    for (const id of espnSet) if (!ALL_TEAM_IDS.has(id)) problems.push(`ESPN id ${id} not assigned to a group`);
  }
  return problems;
}

module.exports = { GROUPS, ID_TO_GROUP, LETTERS, ALL_TEAM_IDS, validate };
