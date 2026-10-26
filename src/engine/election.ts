import { REGIONS } from './data';
import { clamp, random } from './random';
import type { ElectionResult, Game, Region } from './types';
export function regionalApproval(game: Game, r: Region) {
  const affinity =
    8 -
    Math.abs(game.profile.social - r.ideology) * 2 -
    Math.abs(game.profile.economic - r.economic) * 1.5;
  return clamp(
    game.metrics.approval -
      4 +
      affinity +
      (r.uf === game.profile.state ? 5 : 0) +
      (game.metrics.growth - 2.1) * (r.development / 45),
    5,
    95,
  );
}
export function poll(game: Game, region?: Region, runoff = false): ElectionResult[] {
  const r = region ?? ({ ideology: 0, economic: 0, uf: 'BR', development: 50 } as Region);
  const approval = region ? regionalApproval(game, r) : game.metrics.approval;
  const attrs = game.profile.attributes;
  const playerScore = clamp(
    16 +
      approval * 0.58 +
      game.elections.momentum +
      game.elections.exposure * 0.1 +
      attrs.charisma * 0.5 +
      attrs.speech * 0.25 -
      Math.abs(game.profile.social - r.ideology) * 1.5 -
      Math.abs(game.profile.economic - r.economic) * 1.2,
    2,
    110,
  );
  let candidates: ElectionResult[] = [
    {
      id: 'player',
      name: `${game.profile.firstName} ${game.profile.lastName}`,
      party: game.profile.party,
      share: playerScore,
    },
    ...game.elections.rivals.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      share: clamp(
        16 +
          c.popularity * 0.43 +
          (100 - approval) * 0.17 -
          Math.abs(c.ideology - r.ideology) * 2 -
          Math.abs(c.economic - r.economic) * 1.5 +
          c.ambition * 0.15,
        2,
        110,
      ),
    })),
  ];
  if (runoff) {
    const ids = game.elections.firstRound.slice(0, 2).map((c) => c.id);
    candidates = candidates.filter((c) => ids.includes(c.id));
  }
  const total = candidates.reduce((s, c) => s + c.share, 0);
  return candidates
    .map((c) => ({ ...c, share: (c.share / total) * 100 }))
    .sort((a, b) => b.share - a.share);
}
export function nationalPoll(game: Game, runoff = false) {
  const totals: Record<string, ElectionResult> = {};
  const regions =
    game.profile.office === 'Presidente'
      ? REGIONS
      : REGIONS.filter((r) => r.uf === game.profile.state);
  const electorate = regions.reduce((sum, r) => sum + r.electorate, 0);
  for (const r of regions)
    for (const c of poll(game, r, runoff)) {
      totals[c.id] ??= { ...c, share: 0 };
      totals[c.id].share += (c.share * r.electorate) / electorate;
    }
  return Object.values(totals).sort((a, b) => b.share - a.share);
}
export function countElection(game: Game, runoff = false) {
  const totals: Record<string, ElectionResult> = {};
  const regions =
    game.profile.office === 'Presidente'
      ? REGIONS
      : REGIONS.filter((r) => r.uf === game.profile.state);
  const population = regions.reduce((s, r) => s + r.electorate, 0);
  for (const [i, r] of regions.entries()) {
    const votes = poll(game, r, runoff).map((c, j) => ({
      ...c,
      share: Math.max(0.5, c.share + (random(game.seed, game.turn, 100 + i * 10 + j) - 0.5) * 2.8),
    }));
    const sum = votes.reduce((s, c) => s + c.share, 0);
    for (const c of votes) {
      c.share = (c.share / sum) * 100;
      totals[c.id] ??= { ...c, share: 0 };
      totals[c.id].share += (c.share * r.electorate) / population;
    }
    game.elections.resultsByState[r.uf] = votes.find((c) => c.id === 'player')?.share ?? 0;
  }
  return Object.values(totals).sort((a, b) => b.share - a.share);
}
export const CAMPAIGN_ACTIONS = {
  debate: {
    name: 'Debate televisionado',
    cost: 3,
    capital: 4,
    description:
      'Oratória e preparo econômico fortalecem sua posição; adversários também respondem.',
  },
  advertising: {
    name: 'Propaganda eleitoral',
    cost: 8,
    capital: 0,
    description: 'Compra alcance; o retorno cai conforme a exposição da campanha aumenta.',
  },
  visit: {
    name: 'Agenda nos estados',
    cost: 2,
    capital: 3,
    description: 'Aproxima a candidatura do eleitorado e das lideranças regionais.',
  },
  interview: {
    name: 'Entrevista à imprensa',
    cost: 0,
    capital: 4,
    description: 'Carisma e integridade ajudam a conquistar confiança e visibilidade.',
  },
  fundraising: {
    name: 'Arrecadação transparente',
    cost: 0,
    capital: 5,
    description: 'Mobiliza doações individuais; depende de integridade e apoio popular.',
  },
};
