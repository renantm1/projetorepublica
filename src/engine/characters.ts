import { PARTIES } from './data';
import type { Candidate, Game } from './types';
import { clamp } from './random';
export function createRivals(partyId: string): Candidate[] {
  return PARTIES.filter((p) => p.id !== partyId)
    .sort((a, b) => b.seats - a.seats)
    .slice(0, 3)
    .map((p, i) => ({
      id: p.id,
      name: p.leader,
      party: p.id,
      ideology: p.ideology,
      economic: p.economic,
      popularity: 48 - i * 4,
      ambition: 65 + i * 8,
      negotiation: 55 + i * 6,
      strategy:
        i === 0
          ? 'Mobilização popular'
          : i === 1
            ? 'Aliança pelo crescimento'
            : 'Diálogo com o centro',
    }));
}
export function rivalsTurn(game: Game) {
  for (const rival of game.elections.rivals) {
    const discontent = (50 - game.metrics.approval) * 0.02;
    const affinity = Math.abs(rival.economic - game.profile.economic);
    rival.popularity = clamp(rival.popularity + discontent + affinity * 0.01, 15, 85);
    if (game.turn > 36) {
      rival.strategy =
        game.metrics.inflation > 6
          ? 'Combate ao custo de vida'
          : game.metrics.unemployment > 9
            ? 'Emprego e renda'
            : 'Renovação e alianças';
    }
  }
}
