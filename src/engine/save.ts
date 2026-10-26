import { z } from 'zod';
import { PARTIES, POLICIES, REGIONS } from './data';
import { EVENTS } from './events';
import type { Game } from './types';
const finite = z.number().finite();
const score = finite.min(0).max(100);
const str = z.string().max(2000);
const party = z.enum(PARTIES.map((p) => p.id) as [string, ...string[]]);
const metricSchema = z.object({
  gdp: finite.min(3).max(50),
  growth: finite.min(-12).max(12),
  inflation: finite.min(-2).max(35),
  selic: finite.min(2).max(30),
  unemployment: finite.min(2).max(30),
  debt: finite.min(15).max(180),
  balance: finite.min(-12).max(8),
  fdi: finite.min(5).max(200),
  exchange: finite.min(2).max(12),
  income: finite.min(1000).max(15000),
  poverty: score,
  inequality: finite.min(0.25).max(0.75),
  security: score,
  education: score,
  health: score,
  infrastructure: score,
  trust: score,
  approval: score,
  stability: score,
  governors: score,
  pressure: score,
});
const effects = z.object(
  Object.fromEntries(
    [...Object.keys(metricSchema.shape), 'capital', 'momentum', 'funds'].map((k) => [
      k,
      finite.optional(),
    ]),
  ),
);
const result = z.object({ id: str, name: str, party, share: finite.min(0).max(100) });
const attributes = z.object({
  charisma: finite.int().min(1).max(10),
  speech: finite.int().min(1).max(10),
  negotiation: finite.int().min(1).max(10),
  economics: finite.int().min(1).max(10),
  politics: finite.int().min(1).max(10),
  popularity: finite.int().min(1).max(10),
  integrity: finite.int().min(1).max(10),
  influence: finite.int().min(1).max(10),
});
const schema = z.object({
  version: z.literal(1),
  seed: finite.int().min(0).max(2147483647),
  turn: finite.int().min(0).max(48),
  profile: z.object({
    firstName: z.string().min(1).max(30),
    lastName: z.string().min(1).max(40),
    age: finite.int().min(18).max(85),
    state: z.enum(REGIONS.map((r) => r.uf) as [string, ...string[]]),
    party,
    ideology: finite.int().min(-3).max(3),
    economic: finite.int().min(-3).max(3),
    social: finite.int().min(-3).max(3),
    background: str,
    attributes,
    difficulty: z.enum(['Aprendiz', 'Estrategista', 'Veterano']),
    mode: z.enum(['presidential', 'career']),
    office: z.enum([
      'Vereador',
      'Deputado estadual',
      'Deputado federal',
      'Senador',
      'Governador',
      'Presidente',
    ]),
  }),
  metrics: metricSchema,
  capital: score,
  actions: finite.int().min(0).max(3),
  relations: z.object(Object.fromEntries(PARTIES.map((p) => [p.id, score]))),
  coalition: z.array(party).max(8),
  policies: z.partialRecord(
    z.enum(POLICIES.map((p) => p.id) as [string, ...string[]]),
    finite.min(0).max(3),
  ),
  activePolicies: z.partialRecord(
    z.enum(POLICIES.map((p) => p.id) as [string, ...string[]]),
    finite.min(0).max(3),
  ),
  implementations: z
    .array(
      z.object({
        policyId: z.enum(POLICIES.map((p) => p.id) as [string, ...string[]]),
        level: finite.min(0).max(3),
        due: finite.int().min(0).max(100),
      }),
    )
    .max(9),
  bill: z
    .object({
      policyId: z.enum(POLICIES.map((p) => p.id) as [string, ...string[]]),
      level: finite.int().min(0).max(3),
      amendment: z.boolean(),
      status: z.enum(['debate', 'senate', 'veto', 'approved', 'rejected', 'vetoed']),
      deputies: finite.int().min(0).max(513).optional(),
      senators: finite.int().min(0).max(81).optional(),
    })
    .nullable(),
  groups: z.object({ workers: score, business: score, public: score, youth: score, rural: score }),
  eventId: z.enum(EVENTS.map((e) => e.id) as [string, ...string[]]).nullable(),
  seenEvents: z.array(str).max(100),
  delayed: z.array(z.object({ due: finite.int().min(0).max(100), effects, source: str })).max(500),
  history: z
    .array(
      z.object({
        id: str,
        turn: finite.int().min(0).max(48),
        type: z.enum(['economy', 'event', 'congress', 'election', 'government']),
        title: str,
        detail: str,
      }),
    )
    .max(2000),
  series: z
    .array(
      z.object({
        turn: finite.int().min(0).max(48),
        approval: finite,
        growth: finite,
        inflation: finite,
        debt: finite,
      }),
    )
    .min(1)
    .max(49),
  elections: z.object({
    funds: finite.min(0).max(150),
    momentum: finite.min(-25).max(25),
    exposure: finite.min(0).max(1000),
    actionsThisTurn: finite.int().min(0).max(2),
    rivals: z
      .array(
        z.object({
          id: str,
          name: str,
          party,
          ideology: finite,
          economic: finite,
          popularity: score,
          ambition: score,
          negotiation: score,
          strategy: str,
        }),
      )
      .length(3),
    phase: z.enum(['campaign', 'runoff', 'complete']),
    firstRound: z.array(result).max(4),
    runoff: z.array(result).max(2),
    won: z.boolean().nullable(),
    resultsByState: z.record(z.string(), finite.min(0).max(100)),
  }),
  finished: z.boolean(),
});
export function parseSave(text: string): Game {
  if (text.length > 2_000_000) throw new Error('Arquivo maior que o limite de 2 MB.');
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Arquivo inválido. Selecione um salvamento JSON exportado pelo jogo.');
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    throw new Error('Arquivo incompatível ou corrompido. Use um salvamento REPÚBLICA v1.');
  const g = parsed.data as Game;
  if (
    g.finished !== (g.turn === 48) ||
    g.series.length !== g.turn + 1 ||
    g.series[g.turn].turn !== g.turn ||
    new Set(g.coalition).size !== g.coalition.length
  )
    throw new Error('O salvamento contém um histórico inconsistente.');
  return g;
}
export const SAVE_KEY = 'republica.campaign.v1';
export function readSave(): Game | null {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? parseSave(data) : null;
  } catch {
    return null;
  }
}
export function writeSave(game: Game) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}
