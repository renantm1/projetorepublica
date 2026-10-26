import { describe, expect, it } from 'vitest';
import { createGame, execute } from './game';
import { DEFAULT_PROFILE, PARTIES, POLICIES, REGIONS } from './data';
import { EVENTS } from './events';
import { economyTurn } from './economy';
import { forecast } from './legislature';
import { countElection, nationalPoll, poll } from './election';
import { parseSave } from './save';
import type { Game, GameAction } from './types';
const doAction = (g: Game, a: GameAction) => execute(g, a).game;
function resolve(g: Game) {
  if (!g.eventId) return g;
  const event = EVENTS.find((e) => e.id === g.eventId)!;
  const choice = event.choices.findIndex((c) => g.capital + (c.effects.capital ?? 0) >= 0);
  return doAction(g, { type: 'decide', choice });
}
function runMandate(seed: number) {
  let g = createGame(DEFAULT_PROFILE, seed);
  for (let i = 0; i < 48; i++) {
    g = resolve(g);
    if (g.elections.phase === 'runoff') g = doAction(g, { type: 'runoff' });
    g = doAction(g, { type: 'advance' });
  }
  return g;
}
describe('turnos e mandato presidencial', () => {
  it('bloqueia o avanço com decisão pendente e preserva o estado original', () => {
    const g = createGame();
    const before = JSON.stringify(g);
    const result = execute(g, { type: 'advance' });
    expect(result.game).toBe(g);
    expect(JSON.stringify(g)).toBe(before);
    expect(result.message).toContain('decisão');
  });
  it('processa 48 meses, apura eleições e encerra o ciclo de quatro anos', () => {
    const g = runMandate(2027);
    expect(g.turn).toBe(48);
    expect(g.finished).toBe(true);
    expect(g.series).toHaveLength(49);
    expect(g.elections.phase).toBe('complete');
    expect(g.elections.won).not.toBeNull();
    expect(g.history.some((h) => h.title === 'Balanço de um mandato')).toBe(true);
    expect(doAction(g, { type: 'advance' })).toBe(g);
  });
  it('reproduz a mesma partida pela seed e distingue seeds diferentes', () => {
    expect(runMandate(1337)).toEqual(runMandate(1337));
    expect(runMandate(1337).metrics).not.toEqual(runMandate(1338).metrics);
  });
  it('aplica consequências apenas quando o prazo chega e apenas uma vez', () => {
    let g = createGame();
    g = doAction(g, { type: 'decide', choice: 1 });
    expect(g.metrics.health).toBe(48);
    expect(g.delayed).toHaveLength(1);
    g = doAction(g, { type: 'advance' });
    expect(g.metrics.health).toBe(48);
    g = doAction(g, { type: 'advance' });
    expect(g.metrics.health).toBe(51);
    expect(g.delayed).toHaveLength(0);
    g = doAction(g, { type: 'advance' });
    expect(g.metrics.health).toBe(51);
  });
  it('não cria aprovação perfeita e mantém indicadores finitos em estratégias extremas', () => {
    for (const side of [-3, 0, 3]) {
      let g = createGame(
        { ...DEFAULT_PROFILE, ideology: side, economic: side, social: side },
        900 + side,
      );
      g.policies = Object.fromEntries(POLICIES.map((p) => [p.id, 3]));
      g.activePolicies = { ...g.policies };
      for (const p of POLICIES)
        g.history.push({
          id: p.id,
          turn: 0,
          type: 'congress',
          title: 'Lei promulgada',
          detail: `[${p.id}] teste`,
        });
      for (let i = 0; i < 48; i++) {
        g = resolve(g);
        if (g.elections.phase === 'runoff') g = doAction(g, { type: 'runoff' });
        g = doAction(g, { type: 'advance' });
        expect(g.metrics.approval).toBeLessThanOrEqual(95);
        expect(g.metrics.approval).toBeGreaterThanOrEqual(5);
        expect(Object.values(g.metrics).every(Number.isFinite)).toBe(true);
      }
    }
  });
  it('recupera a agenda mensal e impede gastos sem capital', () => {
    let g = resolve(createGame());
    g.capital = 0;
    expect(doAction(g, { type: 'propose', policy: 'health', level: 1 })).toBe(g);
    expect(doAction(g, { type: 'negotiate', party: 'FP', approach: 'dialogue' })).toBe(g);
    g = doAction(g, { type: 'advance' });
    expect(g.actions).toBe(3);
    expect(g.capital).toBeGreaterThan(0);
  });
});
describe('economia e políticas', () => {
  it('mantém serviços existentes durante a implantação de uma ampliação', () => {
    let g = resolve(createGame());
    g.policies.health = 1;
    g.activePolicies.health = 1;
    for (const p of PARTIES) g.relations[p.id] = 95;
    g.coalition = PARTIES.map((p) => p.id);
    g = doAction(g, { type: 'propose', policy: 'health', level: 2 });
    g = doAction(g, { type: 'vote' });
    g = doAction(g, { type: 'vote' });
    g = doAction(g, { type: 'veto', veto: false });
    expect(g.policies.health).toBe(2);
    expect(g.activePolicies.health).toBe(1);
    const initialHealth = g.metrics.health;
    g = doAction(g, { type: 'advance' });
    expect(g.activePolicies.health).toBe(1);
    expect(g.metrics.health).toBeGreaterThan(initialHealth);
    g = doAction(g, { type: 'advance' });
    expect(g.activePolicies.health).toBe(1);
    g = doAction(g, { type: 'advance' });
    expect(g.activePolicies.health).toBe(2);
    expect(g.implementations).toHaveLength(0);
    expect(parseSave(JSON.stringify(g))).toEqual(g);
  });
  it('investimento em saúde exige custeio e só melhora serviços após implementação', () => {
    const base = resolve(createGame());
    const invested = structuredClone(base);
    invested.policies.health = 3;
    invested.history.unshift({
      id: 'health',
      turn: 0,
      type: 'congress',
      title: 'Lei promulgada',
      detail: '[health] lei',
    });
    invested.turn = 1;
    expect(economyTurn(invested).health).toBe(base.metrics.health);
    invested.turn = 6;
    invested.activePolicies.health = 3;
    const result = economyTurn(invested);
    expect(result.health).toBeGreaterThan(base.metrics.health);
    expect(result.balance).toBeLessThan(base.metrics.balance);
  });
  it('revisão de despesas melhora o fiscal e pressiona a saúde', () => {
    const g = resolve(createGame());
    g.turn = 6;
    g.policies.fiscal = 3;
    g.activePolicies.fiscal = 3;
    g.history.unshift({
      id: 'fiscal',
      turn: 0,
      type: 'congress',
      title: 'Lei promulgada',
      detail: '[fiscal] lei',
    });
    const result = economyTurn(g);
    expect(result.balance).toBeGreaterThan(g.metrics.balance);
    expect(result.health).toBeLessThan(g.metrics.health);
  });
  it('Banco Central reage à inflação com defasagem', () => {
    const low = createGame(),
      high = createGame();
    low.metrics.inflation = 3;
    high.metrics.inflation = 10;
    expect(economyTurn(high).selic).toBeGreaterThan(economyTurn(low).selic);
  });
});
describe('Congresso e negociação', () => {
  it('representa exatamente 513 deputados e 81 senadores', () => {
    expect(PARTIES.reduce((s, p) => s + p.seats, 0)).toBe(513);
    expect(PARTIES.reduce((s, p) => s + p.senate, 0)).toBe(81);
  });
  it('rejeita um projeto sem base e não permite pular a tramitação', () => {
    let g = resolve(createGame());
    g.coalition = [];
    for (const p of PARTIES) g.relations[p.id] = 0;
    g = doAction(g, { type: 'propose', policy: 'enterprise', level: 1 });
    expect(forecast(g)).toBeLessThan(257);
    expect(doAction(g, { type: 'veto', veto: false })).toBe(g);
    g = doAction(g, { type: 'vote' });
    expect(g.bill?.status).toBe('rejected');
    expect(g.policies.enterprise).toBeUndefined();
  });
  it('negociação consome recursos e concessão orçamentária afeta as contas', () => {
    let g = resolve(createGame());
    const old = g.relations.FP;
    const balance = g.metrics.balance;
    g = doAction(g, { type: 'negotiate', party: 'FP', approach: 'budget' });
    expect(g.relations.FP).toBeGreaterThan(old);
    expect(g.actions).toBe(2);
    expect(g.metrics.balance).toBeCloseTo(balance - 0.12);
    expect(g.capital).toBeLessThan(65);
  });
  it('emenda amplia apoio e reduz o alcance da lei após as duas Casas', () => {
    let g = resolve(createGame());
    for (const p of PARTIES) g.relations[p.id] = 95;
    g.coalition = PARTIES.map((p) => p.id);
    g = doAction(g, { type: 'propose', policy: 'health', level: 1 });
    const before = forecast(g);
    g = doAction(g, { type: 'amend' });
    expect(forecast(g)).toBeGreaterThan(before);
    g = doAction(g, { type: 'vote' });
    expect(g.bill?.status).toBe('senate');
    g = doAction(g, { type: 'vote' });
    expect(g.bill?.status).toBe('veto');
    expect(g.policies.health).toBeUndefined();
    g = doAction(g, { type: 'veto', veto: false });
    expect(g.bill?.status).toBe('approved');
    expect(g.policies.health).toBe(0.5);
  });
  it('impede proposição simultânea e respeita intensidade máxima', () => {
    let g = resolve(createGame());
    g = doAction(g, { type: 'propose', policy: 'health', level: 1 });
    expect(doAction(g, { type: 'propose', policy: 'education', level: 1 })).toBe(g);
    expect(
      doAction(resolve(createGame()), { type: 'propose', policy: 'health', level: 4 }),
    ).toEqual(resolve(createGame()));
  });
});
describe('eleições', () => {
  it('pondera os 27 estados e normaliza votos a 100%', () => {
    const g = createGame();
    expect(REGIONS).toHaveLength(27);
    expect(new Set(REGIONS.map((r) => r.uf)).size).toBe(27);
    for (const state of REGIONS)
      expect(poll(g, state).reduce((s, c) => s + c.share, 0)).toBeCloseTo(100);
    expect(nationalPoll(g).reduce((s, c) => s + c.share, 0)).toBeCloseTo(100);
    const result = countElection(g);
    expect(result.reduce((s, c) => s + c.share, 0)).toBeCloseTo(100);
    expect(Object.keys(g.elections.resultsByState)).toHaveLength(27);
  });
  it('campanha muda intenção de voto e não permite ações ilimitadas', () => {
    let g = resolve(createGame());
    const before = nationalPoll(g).find((c) => c.id === 'player')!.share;
    g = doAction(g, { type: 'campaign', strategy: 'advertising' });
    g = doAction(g, { type: 'campaign', strategy: 'interview' });
    expect(nationalPoll(g).find((c) => c.id === 'player')!.share).toBeGreaterThan(before);
    expect(g.elections.funds).toBe(12);
    expect(g.elections.actionsThisTurn).toBe(2);
    expect(doAction(g, { type: 'campaign', strategy: 'advertising' })).toBe(g);
  });
  it('melhor governo aumenta a intenção de voto, sem votos arbitrários', () => {
    const low = createGame(),
      high = createGame();
    low.metrics.approval = 15;
    high.metrics.approval = 85;
    expect(nationalPoll(high).find((c) => c.id === 'player')!.share).toBeGreaterThan(
      nationalPoll(low).find((c) => c.id === 'player')!.share,
    );
  });
  it('exige conclusão do segundo turno e registra ganhador', () => {
    let g = resolve(createGame());
    g.turn = 44;
    g = doAction(g, { type: 'advance' });
    expect(g.elections.phase).toBe('runoff');
    expect(g.elections.firstRound).toHaveLength(4);
    expect(doAction(g, { type: 'advance' })).toBe(g);
    g = doAction(g, { type: 'runoff' });
    expect(g.elections.runoff).toHaveLength(2);
    expect(g.elections.runoff.reduce((s, c) => s + c.share, 0)).toBeCloseTo(100);
    expect(g.elections.phase).toBe('complete');
    expect(g.elections.won).not.toBeNull();
  });
  it('dispensa segundo turno quando há mais de 50% no primeiro', () => {
    let g = resolve(createGame());
    g.turn = 44;
    g.metrics.approval = 95;
    g.elections.momentum = 25;
    g.elections.exposure = 100;
    for (const rival of g.elections.rivals) rival.popularity = 15;
    g = doAction(g, { type: 'advance' });
    expect(g.elections.firstRound[0].share).toBeGreaterThan(50);
    expect(g.elections.phase).toBe('complete');
    expect(g.elections.won).toBe(true);
  });
});
describe('salvamento', () => {
  it('restaura a partida e reproduz o próximo turno', () => {
    const g = resolve(createGame());
    const restored = parseSave(JSON.stringify(g));
    expect(restored).toEqual(g);
    expect(doAction(restored, { type: 'advance' })).toEqual(doAction(g, { type: 'advance' }));
  });
  it('valida salvamentos ao longo de um mandato completo', () => {
    let g = createGame();
    for (let i = 0; i < 48; i++) {
      g = resolve(g);
      if (g.elections.phase === 'runoff') g = doAction(g, { type: 'runoff' });
      g = doAction(g, { type: 'advance' });
      expect(parseSave(JSON.stringify(g))).toEqual(g);
    }
  });
  it('rejeita arquivos corrompidos, versões inválidas e dados não finitos', () => {
    expect(() => parseSave('{}')).toThrow();
    expect(() => parseSave('{broken')).toThrow();
    const g = createGame();
    g.version = 2 as 1;
    expect(() => parseSave(JSON.stringify(g))).toThrow();
    g.version = 1;
    g.metrics.approval = Infinity;
    expect(() => parseSave(JSON.stringify(g))).toThrow();
  });
  it('rejeita histórico inconsistente e evita carregar políticas desconhecidas', () => {
    const g = createGame();
    g.turn = 4;
    expect(() => parseSave(JSON.stringify(g))).toThrow();
    g.turn = 0;
    g.policies.unknown = 2;
    expect(() => parseSave(JSON.stringify(g))).toThrow();
  });
});
