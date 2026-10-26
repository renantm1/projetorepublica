import { POLICIES } from './data';
import { clamp, random } from './random';
import type { Effects, Game, Metrics } from './types';
export function boundMetrics(m: Metrics): Metrics {
  const next = { ...m };
  for (const key of [
    'security',
    'education',
    'health',
    'infrastructure',
    'trust',
    'approval',
    'stability',
    'governors',
    'pressure',
    'poverty',
  ] as const)
    next[key] = clamp(next[key], key === 'approval' ? 5 : 0, key === 'approval' ? 95 : 100);
  next.growth = clamp(next.growth, -12, 12);
  next.inflation = clamp(next.inflation, -2, 35);
  next.selic = clamp(next.selic, 2, 30);
  next.unemployment = clamp(next.unemployment, 2, 30);
  next.debt = clamp(next.debt, 15, 180);
  next.balance = clamp(next.balance, -12, 8);
  next.fdi = clamp(next.fdi, 5, 200);
  next.exchange = clamp(next.exchange, 2, 12);
  next.income = clamp(next.income, 1000, 15000);
  next.inequality = clamp(next.inequality, 0.25, 0.75);
  next.gdp = clamp(next.gdp, 3, 50);
  return next;
}
export function applyEffects(game: Game, effects: Effects) {
  const metrics = { ...game.metrics };
  for (const [key, value] of Object.entries(effects))
    if (key in metrics) metrics[key as keyof Metrics] += value;
  game.metrics = boundMetrics(metrics);
  game.capital = clamp(game.capital + (effects.capital ?? 0));
  game.elections.momentum = clamp(game.elections.momentum + (effects.momentum ?? 0), -25, 25);
  game.elections.funds = clamp(game.elections.funds + (effects.funds ?? 0), 0, 150);
}
export function economyTurn(game: Game): Metrics {
  const old = game.metrics;
  const m = { ...old };
  let fiscal = -1.2;
  for (const policy of POLICIES) {
    fiscal -= (game.policies[policy.id] ?? 0) * policy.cost;
    const level = game.activePolicies[policy.id] ?? 0;
    if (level > 0) {
      const efficiency = 0.75 + game.profile.attributes.economics * 0.04;
      for (const [k, v] of Object.entries(policy.effects))
        if (k !== 'balance') m[k as keyof Metrics] += v * level * efficiency;
    }
  }
  const shock = (random(game.seed, game.turn, 1) - 0.5) * 0.24;
  const difficulty =
    game.profile.difficulty === 'Veterano'
      ? 0.045
      : game.profile.difficulty === 'Aprendiz'
        ? -0.035
        : 0;
  m.balance += (fiscal - old.balance) * 0.08 + (old.growth - 2.1) * 0.018;
  const inflationTarget =
    3.6 + Math.max(0, -old.balance) * 0.23 + Math.max(0, old.growth - 2.5) * 0.22;
  m.inflation += (inflationTarget - old.inflation) * 0.055 + shock * 0.4 + difficulty;
  // Banco Central autônomo: reação defasada à inflação, sem controle direto do jogador.
  m.selic += (7 + (old.inflation - 3) * 1.3 - old.selic) * 0.1;
  const potential =
    2.3 +
    (old.infrastructure - 46) * 0.025 +
    (old.education - 51) * 0.015 -
    (old.selic - 9) * 0.075;
  m.growth += (potential - old.growth) * 0.06 + shock - difficulty;
  m.unemployment += (8.2 - (old.growth - 2.1) * 0.65 - old.unemployment) * 0.1;
  m.debt += (-m.balance + ((old.selic * 0.62 - old.growth - old.inflation) * old.debt) / 100) / 12;
  m.gdp *= 1 + (m.growth + m.inflation) / 1200;
  m.income *= 1 + (m.growth * 0.4 - (m.inflation - 4) * 0.12) / 1200;
  m.fdi += (64 + (old.trust - 52) * 0.35 + (old.growth - 2.1) * 3 - old.fdi) * 0.025;
  m.exchange +=
    (5.12 + (old.inflation - 4.8) * 0.07 - (old.fdi - 64) * 0.006 - old.exchange) * 0.08;
  m.poverty += (m.unemployment - old.unemployment) * 0.12 - (m.income - old.income) / 1500;
  m.pressure += ((100 - old.approval) * 0.68 - old.pressure) * 0.12;
  return boundMetrics(m);
}
