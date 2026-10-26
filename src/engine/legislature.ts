import { PARTIES, POLICIES } from './data';
import { clamp, random } from './random';
import type { Game, Party } from './types';
export function partySupport(game: Game, party: Party, senate = false) {
  const policy = POLICIES.find((p) => p.id === game.bill?.policyId);
  const ideology = policy?.ideology ?? game.profile.ideology;
  const proximity = 1 - Math.abs(ideology - party.ideology) / 6;
  const relation = (game.relations[party.id] ?? 40) / 100;
  return clamp(
    0.02 +
      proximity * 0.23 +
      relation * 0.43 +
      (game.coalition.includes(party.id) ? 0.16 : 0) +
      (game.metrics.approval - 50) * 0.002 +
      (game.bill?.amendment ? 0.1 : 0) -
      (senate ? 0.035 : 0),
    0.06,
    0.97,
  );
}
export function forecast(game: Game, senate = false) {
  return PARTIES.reduce(
    (sum, p) => sum + Math.round((senate ? p.senate : p.seats) * partySupport(game, p, senate)),
    0,
  );
}
export function voteCount(game: Game, senate = false) {
  return PARTIES.reduce(
    (sum, p, i) =>
      sum +
      Math.round(
        (senate ? p.senate : p.seats) *
          clamp(
            partySupport(game, p, senate) +
              (random(game.seed, game.turn, 50 + i + (senate ? 10 : 0)) - 0.5) * 0.1,
            0,
            1,
          ),
      ),
    0,
  );
}
export function coalitionSeats(game: Game) {
  return PARTIES.filter((p) => game.coalition.includes(p.id)).reduce((s, p) => s + p.seats, 0);
}
export function canLegislate(game: Game) {
  return [
    'Presidente',
    'Governador',
    'Deputado estadual',
    'Deputado federal',
    'Senador',
    'Vereador',
  ].includes(game.profile.office);
}
export function hasExecutiveAuthority(game: Game) {
  return game.profile.office === 'Presidente' || game.profile.office === 'Governador';
}
