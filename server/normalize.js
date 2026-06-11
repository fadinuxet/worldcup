// Pure transforms: ESPN payloads -> our normalized Team / Match shapes. No I/O.

const { ID_TO_GROUP, ALL_TEAM_IDS } = require('./config/groups');

const STAGE_LABELS = {
  'group-stage': 'Group Stage',
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  'quarterfinal': 'Quarterfinal',
  'quarterfinals': 'Quarterfinal',
  'semifinal': 'Semifinal',
  'semifinals': 'Semifinal',
  'third-place': 'Third Place',
  'final': 'Final',
};

function stageLabel(slug) {
  if (!slug) return '';
  if (STAGE_LABELS[slug]) return STAGE_LABELS[slug];
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ESPN /teams -> [Team] with group merged
function buildTeams(teamsJson) {
  const raw = teamsJson?.sports?.[0]?.leagues?.[0]?.teams || [];
  return raw
    .map(({ team }) => ({
      id: String(team.id),
      name: team.displayName,
      abbr: team.abbreviation,
      logo: team.logos?.[0]?.href || null,
      group: ID_TO_GROUP[String(team.id)] || null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function competitor(c) {
  const t = c?.team || {};
  return {
    id: String(t.id ?? ''),
    name: t.displayName || t.shortDisplayName || t.name || 'TBD',
    abbr: t.abbreviation || '',
    logo: t.logo || t.logos?.[0]?.href || null,
    score: c?.score ?? null,
  };
}

// One ESPN scoreboard event -> Match
function normalizeMatch(event) {
  const comp = event?.competitions?.[0] || {};
  const competitors = comp.competitors || [];
  const home = competitor(competitors.find(c => c.homeAway === 'home') || competitors[0] || {});
  const away = competitor(competitors.find(c => c.homeAway === 'away') || competitors[1] || {});
  const status = comp.status?.type || {};
  const slug = event?.season?.slug || '';
  const isPlaceholder = !ALL_TEAM_IDS.has(home.id) || !ALL_TEAM_IDS.has(away.id);

  return {
    id: String(event.id),
    date: event.date,                                  // UTC ISO; client converts to local TZ
    stage: slug,
    stageLabel: stageLabel(slug),
    status: status.state || 'pre',                     // pre | in | post
    statusDetail: status.description || '',            // "Scheduled" | "First Half" | "FT" ...
    clock: status.state === 'in' ? (comp.status?.displayClock || null) : null,
    venue: comp.venue?.fullName || null,
    home,
    away,
    isPlaceholder,
  };
}

module.exports = { buildTeams, normalizeMatch, stageLabel };
