// Compute group tables from finished group-stage results. ESPN doesn't expose WC standings,
// so we derive them. Pre-tournament (no finished matches) => all-zero rows (correct).

const { GROUPS, ID_TO_GROUP } = require('./config/groups');

function blankRow(teamId) {
  return { teamId, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
}

function computeStandings(matches) {
  // letter -> { teamId -> row }
  const tables = {};
  for (const [letter, ids] of Object.entries(GROUPS)) {
    tables[letter] = {};
    for (const id of ids) tables[letter][id] = blankRow(id);
  }

  for (const m of matches) {
    if (m.stage !== 'group-stage' || m.status !== 'post') continue;
    const hg = ID_TO_GROUP[m.home.id];
    const ag = ID_TO_GROUP[m.away.id];
    if (!hg || hg !== ag) continue;                 // both must be real teams in the same group
    const hs = parseInt(m.home.score, 10);
    const as = parseInt(m.away.score, 10);
    if (Number.isNaN(hs) || Number.isNaN(as)) continue;

    const H = tables[hg][m.home.id];
    const A = tables[ag][m.away.id];
    H.P++; A.P++;
    H.GF += hs; H.GA += as;
    A.GF += as; A.GA += hs;
    if (hs > as) { H.W++; H.Pts += 3; A.L++; }
    else if (hs < as) { A.W++; A.Pts += 3; H.L++; }
    else { H.D++; A.D++; H.Pts++; A.Pts++; }
  }

  const out = {};
  for (const [letter, byId] of Object.entries(tables)) {
    const rows = Object.values(byId);
    for (const r of rows) r.GD = r.GF - r.GA;
    rows.sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.teamId.localeCompare(b.teamId));
    rows.forEach((r, i) => { r.rank = i + 1; });
    out[letter] = rows;
  }
  return out;
}

module.exports = { computeStandings };
