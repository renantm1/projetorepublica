import { clamp } from './random';
import type { Game } from './types';
export function updateOpinion(game: Game) {
  const m = game.metrics,
    p = game.policies;
  const economy = (m.growth - 2.1) * 2.3 - (m.inflation - 4.8) * 1.9 - (m.unemployment - 8.2) * 2;
  const base = 43 + economy + (m.trust - 50) * 0.22 + game.profile.attributes.charisma * 0.7;
  const targets = {
    workers: base + (28.4 - m.poverty) * 1.4 + (p.income ?? 0) * 2 + (m.health - 48) * 0.3,
    business:
      base +
      (m.fdi - 64) * 0.35 +
      (p.enterprise ?? 0) * 3 +
      (m.balance + 1.2) * 2 -
      (m.debt - 75.8) * 0.3,
    public: base + (m.education - 51) * 0.6 + (m.health - 48) * 0.4 - (p.fiscal ?? 0) * 3,
    youth: base + (m.education - 51) * 0.7 + (p.climate ?? 0) * 2 + (m.trust - 52) * 0.3,
    rural:
      base + (m.infrastructure - 46) * 0.6 + (m.security - 43) * 0.25 + (p.enterprise ?? 0) * 1.5,
  };
  for (const [key, target] of Object.entries(targets))
    game.groups[key] = clamp(game.groups[key] * 0.85 + target * 0.15, 8, 92);
  const weighted =
    game.groups.workers * 0.4 +
    game.groups.business * 0.13 +
    game.groups.public * 0.16 +
    game.groups.youth * 0.19 +
    game.groups.rural * 0.12;
  game.metrics.approval = clamp(game.metrics.approval * 0.72 + weighted * 0.28, 5, 95);
  game.metrics.stability = clamp(
    game.metrics.stability +
      (game.metrics.trust - 50) * 0.007 -
      (game.metrics.pressure - 40) * 0.009,
  );
}
