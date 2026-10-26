import { DEFAULT_PROFILE, INITIAL_METRICS, PARTIES, POLICIES } from './data';
import { EVENTS } from './events';
import { applyEffects, economyTurn } from './economy';
import { updateOpinion } from './opinion';
import { forecast, hasExecutiveAuthority, voteCount } from './legislature';
import { CAMPAIGN_ACTIONS, countElection } from './election';
import { createRivals, rivalsTurn } from './characters';
import { clamp, random } from './random';
import type { Game, GameAction, HistoryEntry, Profile } from './types';
export function createGame(profile: Profile = DEFAULT_PROFILE, seed = 2027): Game {
  const p = structuredClone(profile);
  if (p.mode === 'presidential') p.office = 'Presidente';
  const approval = clamp(48 + p.attributes.popularity, 5, 95);
  const relations = Object.fromEntries(
    PARTIES.map((party) => [
      party.id,
      clamp(
        (party.id === p.party ? 85 : 65 - Math.abs(p.ideology - party.ideology) * 8) +
          p.attributes.influence,
        15,
        95,
      ),
    ]),
  );
  const coalition = PARTIES.filter((party) => relations[party.id] >= 60).map((party) => party.id);
  return {
    version: 1,
    seed,
    profile: p,
    turn: 0,
    metrics: { ...INITIAL_METRICS, approval },
    capital: p.difficulty === 'Aprendiz' ? 80 : p.difficulty === 'Veterano' ? 50 : 65,
    actions: 3,
    relations,
    coalition,
    policies: {},
    activePolicies: {},
    implementations: [],
    bill: null,
    groups: {
      workers: approval,
      business: approval - 3,
      public: approval + 2,
      youth: approval - 1,
      rural: approval - 2,
    },
    eventId: 'ministry',
    seenEvents: ['ministry'],
    delayed: [],
    history: [
      {
        id: 'inauguration',
        turn: 0,
        type: 'government',
        title: p.office === 'Presidente' ? 'Um novo capítulo começa' : 'Mandato iniciado',
        detail: `${p.firstName} ${p.lastName} assume o cargo de ${p.office.toLowerCase()}. O primeiro orçamento será seu primeiro teste político.`,
      },
    ],
    series: [{ turn: 0, approval, growth: 2.1, inflation: 4.8, debt: 75.8 }],
    elections: {
      funds: 20,
      momentum: 0,
      exposure: 0,
      actionsThisTurn: 0,
      rivals: createRivals(p.party),
      phase: 'campaign',
      firstRound: [],
      runoff: [],
      won: null,
      resultsByState: {},
    },
    finished: false,
  };
}
function record(g: Game, type: HistoryEntry['type'], title: string, detail: string) {
  g.history.unshift({
    id: `${g.turn}-${g.history.length}-${type}`,
    turn: g.turn,
    type,
    title,
    detail,
  });
}
function enact(g: Game) {
  const bill = g.bill!;
  const policy = POLICIES.find((p) => p.id === bill.policyId)!;
  const previous = g.policies[policy.id] ?? 0;
  const level =
    bill.amendment && bill.level > previous ? Math.max(0.5, bill.level - 0.5) : bill.level;
  g.policies[policy.id] = level;
  g.metrics.balance -= (level - previous) * policy.cost;
  g.implementations = g.implementations.filter((item) => item.policyId !== policy.id);
  g.implementations.push({ policyId: policy.id, level, due: g.turn + policy.lag });
  bill.status = 'approved';
  record(
    g,
    'congress',
    'Lei promulgada',
    `[${policy.id}] ${policy.name}: intensidade ${level}. A implementação começa após ${policy.lag} meses. ${bill.amendment ? 'O texto foi reduzido pelo acordo parlamentar.' : ''}`,
  );
}
function finishElection(g: Game, runoff: boolean) {
  const result = countElection(g, runoff);
  if (runoff) g.elections.runoff = result;
  else g.elections.firstRound = result;
  // Legislativo proporcional é representado por um índice de votação de carreira, sem simular quocientes municipais.
  const legislative = ['Vereador', 'Deputado estadual', 'Deputado federal', 'Senador'].includes(
    g.profile.office,
  );
  if (!runoff && !legislative && result[0].share <= 50) {
    g.elections.phase = 'runoff';
    record(
      g,
      'election',
      'Eleição vai ao segundo turno',
      `${result[0].name} (${result[0].share.toFixed(1)}%) e ${result[1].name} (${result[1].share.toFixed(1)}%) disputam o segundo turno. Há uma rodada extra de campanha neste mês.`,
    );
    return;
  }
  g.elections.won = legislative
    ? (result.find((c) => c.id === 'player')?.share ?? 0) >= 25
    : result[0].id === 'player';
  g.elections.phase = 'complete';
  record(
    g,
    'election',
    g.elections.won ? 'Vitória nas urnas' : 'O eleitorado escolheu outro caminho',
    `${result[0].name} lidera a votação com ${result[0].share.toFixed(1)}%. ${g.elections.won ? 'Seu mandato conquistou continuidade.' : 'A alternância de poder faz parte da democracia.'}`,
  );
}
export function execute(state: Game, action: GameAction): { game: Game; message: string } {
  const reject = (message: string) => ({ game: state, message });
  if (state.finished) return reject('O mandato terminou. Inicie uma nova campanha para continuar.');
  if (state.elections.phase === 'runoff' && !['campaign', 'runoff'].includes(action.type))
    return reject('Conclua o segundo turno antes de seguir com o mandato.');
  const g = structuredClone(state);
  let message = '';
  switch (action.type) {
    case 'advance': {
      if (g.eventId) return reject('Uma decisão aguarda sua resposta antes do próximo mês.');
      g.turn++;
      g.actions = 3;
      g.elections.actionsThisTurn = 0;
      for (const item of g.delayed.filter((d) => d.due <= g.turn)) {
        applyEffects(g, item.effects);
        record(
          g,
          'government',
          'Consequências de uma decisão',
          `${item.source}: os efeitos previstos chegaram à execução.`,
        );
      }
      g.delayed = g.delayed.filter((d) => d.due > g.turn);
      for (const item of g.implementations.filter((item) => item.due <= g.turn)) {
        g.activePolicies[item.policyId] = item.level;
        record(
          g,
          'government',
          'Política em execução',
          `${POLICIES.find((p) => p.id === item.policyId)!.name}: intensidade ${item.level}. A implantação chegou aos serviços.`,
        );
      }
      g.implementations = g.implementations.filter((item) => item.due > g.turn);
      g.metrics = economyTurn(g);
      updateOpinion(g);
      rivalsTurn(g);
      g.capital = clamp(
        g.capital + 4 + g.profile.attributes.politics * 0.35 - (g.metrics.pressure > 55 ? 3 : 0),
      );
      g.elections.momentum *= 0.9;
      g.elections.exposure *= 0.97;
      for (const party of PARTIES) {
        const target =
          party.id === g.profile.party
            ? 83
            : 48 -
              Math.abs(g.profile.ideology - party.ideology) * 4 +
              (g.coalition.includes(party.id) ? 14 : 0);
        g.relations[party.id] += (target - g.relations[party.id]) * 0.025;
      }
      if (g.turn % 3 === 0 && g.turn < 45) {
        const available = EVENTS.filter(
          (e) => e.id !== 'ministry' && !g.seenEvents.slice(-5).includes(e.id),
        );
        const event = available[Math.floor(random(g.seed, g.turn, 9) * available.length)];
        g.eventId = event.id;
        g.seenEvents.push(event.id);
      }
      if (g.turn % 2 === 0) {
        record(
          g,
          'economy',
          g.metrics.inflation < state.metrics.inflation
            ? 'Inflação perde força no cenário nacional'
            : 'Custo de vida permanece no centro do debate',
          `Inflação em ${g.metrics.inflation.toFixed(2)}%, crescimento de ${g.metrics.growth.toFixed(2)}% e desemprego em ${g.metrics.unemployment.toFixed(2)}%. A aprovação está em ${g.metrics.approval.toFixed(1)}%.`,
        );
      }
      if (g.turn === 24) {
        record(
          g,
          'congress',
          'Oposição apresenta sua agenda para a segunda metade do mandato',
          `${g.elections.rivals[0].name} articula aliados em torno de emprego e fiscalização. As bancadas reavaliam a relação com o governo.`,
        );
        for (const rival of g.elections.rivals)
          g.relations[rival.party] = clamp(g.relations[rival.party] - 6);
      }
      if (g.turn === 45) finishElection(g, false);
      if (g.turn >= 48) {
        g.finished = true;
        record(
          g,
          'government',
          'Balanço de um mandato',
          `O ciclo de quatro anos chega ao fim. Aprovação final: ${g.metrics.approval.toFixed(1)}%. Dívida: ${g.metrics.debt.toFixed(1)}% do PIB. Resultado eleitoral: ${g.elections.won ? 'vitória' : 'derrota'}.`,
        );
      }
      g.series.push({
        turn: g.turn,
        approval: g.metrics.approval,
        growth: g.metrics.growth,
        inflation: g.metrics.inflation,
        debt: g.metrics.debt,
      });
      message = g.finished
        ? 'Mandato concluído. Seu legado está no histórico.'
        : g.elections.phase === 'runoff'
          ? 'Apuração concluída: prepare o segundo turno.'
          : 'Um novo mês. O país reage às suas escolhas.';
      break;
    }
    case 'decide': {
      const event = EVENTS.find((e) => e.id === g.eventId);
      const choice = event?.choices[action.choice];
      if (!event || !choice) return reject('Esta decisão já foi resolvida.');
      if (g.capital + (choice.effects.capital ?? 0) < 0)
        return reject('Capital político insuficiente para essa alternativa.');
      applyEffects(g, choice.effects);
      if (choice.delayed)
        g.delayed.push({
          due: g.turn + (choice.delay ?? 2),
          effects: choice.delayed,
          source: event.title,
        });
      record(g, 'event', event.title, `${choice.label}. ${choice.detail}`);
      g.eventId = null;
      message = 'Decisão registrada. As consequências já fazem parte do mandato.';
      break;
    }
    case 'propose': {
      if (g.actions < 1) return reject('Sua agenda deste mês está completa. Avance o turno.');
      if (g.bill && ['debate', 'senate', 'veto'].includes(g.bill.status))
        return reject('Conclua a tramitação do projeto atual.');
      const policy = POLICIES.find((p) => p.id === action.policy);
      if (!policy || !Number.isInteger(action.level) || action.level < 0 || action.level > 3)
        return reject('Proposta inválida.');
      if (action.level === (g.policies[policy.id] ?? 0))
        return reject('Essa intensidade já está em vigor.');
      if (g.capital < policy.capital)
        return reject('Capital político insuficiente para protocolar o projeto.');
      g.capital -= policy.capital;
      g.actions--;
      g.bill = { policyId: policy.id, level: action.level, amendment: false, status: 'debate' };
      record(
        g,
        'congress',
        'Projeto protocolado',
        `${policy.name} entra em discussão, com intensidade proposta ${action.level}.`,
      );
      message = 'Projeto enviado à Câmara. Negocie o apoio antes da votação.';
      break;
    }
    case 'amend': {
      if (!g.bill || g.bill.status !== 'debate' || g.bill.amendment)
        return reject('Não há texto disponível para emenda.');
      if (g.capital < 4) return reject('Você precisa de 4 pontos de capital político.');
      g.capital -= 4;
      g.bill.amendment = true;
      message = 'Texto moderado: mais apoio parlamentar, menor alcance da política.';
      break;
    }
    case 'negotiate': {
      const party = PARTIES.find((p) => p.id === action.party);
      if (!party) return reject('Partido não encontrado.');
      if (g.actions < 1) return reject('Sua agenda deste mês está completa.');
      const cost = action.approach === 'dialogue' ? 5 : action.approach === 'agenda' ? 9 : 6;
      if (g.capital < cost) return reject('Capital político insuficiente para negociar.');
      g.capital -= cost;
      g.actions--;
      const gain =
        (action.approach === 'dialogue' ? 6 : action.approach === 'agenda' ? 12 : 16) +
        g.profile.attributes.negotiation * 0.5;
      g.relations[party.id] = clamp(g.relations[party.id] + gain, 0, 95);
      if (action.approach === 'budget') {
        g.metrics.balance -= 0.12;
        g.metrics.trust -= 0.5;
      }
      if (g.relations[party.id] >= 68 && !g.coalition.includes(party.id))
        g.coalition.push(party.id);
      record(
        g,
        'congress',
        `Diálogo com ${party.id}`,
        `${party.name}: ${action.approach === 'budget' ? 'prioridades orçamentárias pactuadas (custo fiscal de 0,12 p.p.).' : action.approach === 'agenda' ? 'acordo de agenda firmado.' : 'rodada de diálogo concluída.'} Relação em ${Math.round(g.relations[party.id])}/100.`,
      );
      message = `A relação com ${party.id} melhorou. Apoio em votação ainda depende do texto.`;
      break;
    }
    case 'vote': {
      if (!g.bill || !['debate', 'senate'].includes(g.bill.status))
        return reject('Nenhum projeto aguarda votação.');
      const senate = g.bill.status === 'senate';
      const votes = voteCount(g, senate);
      const passed = votes >= (senate ? 41 : 257);
      if (senate) g.bill.senators = votes;
      else g.bill.deputies = votes;
      g.bill.status = passed ? (senate ? 'veto' : 'senate') : 'rejected';
      if (!passed) {
        g.capital = clamp(g.capital - 5);
        g.metrics.approval = clamp(g.metrics.approval - 1, 5, 95);
      }
      if (passed && senate && !hasExecutiveAuthority(g)) enact(g);
      record(
        g,
        'congress',
        passed ? 'Projeto aprovado ' + (senate ? 'no Senado' : 'na Câmara') : 'Projeto rejeitado',
        `${votes} votos favoráveis de ${senate ? 81 : 513}. ${passed ? 'A tramitação segue as etapas institucionais.' : 'Será necessário construir um novo acordo.'}`,
      );
      message = `${votes} votos favoráveis. ${passed ? (senate ? 'Texto segue para sanção.' : 'Agora, o Senado. Créditos de negociação são compartilhados entre as Casas.') : 'O projeto não alcançou a maioria.'}`;
      break;
    }
    case 'veto': {
      if (!g.bill || g.bill.status !== 'veto') return reject('Nenhum projeto aguarda sanção.');
      if (action.veto && g.capital < 8)
        return reject('Você precisa de 8 pontos de capital político para vetar.');
      if (!action.veto) {
        enact(g);
        message = 'Lei sancionada. Observe o prazo de implementação.';
      } else {
        const overturned = forecast(g) >= 257 && forecast(g, true) >= 41;
        g.bill.status = 'vetoed';
        g.capital = clamp(g.capital - 8);
        if (overturned) enact(g);
        record(
          g,
          'congress',
          overturned ? 'Congresso derruba o veto' : 'Veto mantido',
          overturned
            ? 'A maioria das duas Casas confirmou o texto. A lei será implementada.'
            : 'A política não entra em vigor.',
        );
        message = overturned ? 'O Congresso derrubou o veto.' : 'Veto mantido pelo Congresso.';
      }
      break;
    }
    case 'campaign': {
      if (g.elections.phase === 'complete') return reject('A eleição já foi concluída.');
      if (
        g.elections.phase === 'runoff' &&
        !g.elections.firstRound.slice(0, 2).some((c) => c.id === 'player')
      )
        return reject('Sua candidatura não está no segundo turno. Acompanhe a apuração.');
      const a = CAMPAIGN_ACTIONS[action.strategy];
      if (!a) return reject('Ação de campanha inválida.');
      if (g.actions < 1 || g.elections.actionsThisTurn >= 2)
        return reject('Limite de duas ações eleitorais por mês. Preserve espaço para governar.');
      if (g.elections.funds < a.cost || g.capital < a.capital)
        return reject('Recursos ou capital político insuficientes.');
      g.actions--;
      g.elections.actionsThisTurn++;
      g.capital -= a.capital;
      g.elections.funds -= a.cost;
      const attrs = g.profile.attributes;
      let gain = 0;
      if (action.strategy === 'fundraising') {
        g.elections.funds = clamp(
          g.elections.funds + 3 + attrs.integrity * 0.5 + g.metrics.approval / 25,
          0,
          150,
        );
      }
      if (action.strategy === 'debate')
        gain = (attrs.speech + attrs.economics) / 5 - 1.5 + (random(g.seed, g.turn, 200) - 0.5) * 2;
      if (action.strategy === 'advertising') {
        gain = 2.6 / (1 + g.elections.exposure / 20);
        g.elections.exposure += 5;
      }
      if (action.strategy === 'visit') {
        gain = 1.2 + attrs.charisma / 10;
        g.metrics.governors = clamp(g.metrics.governors + 1);
      }
      if (action.strategy === 'interview') gain = (attrs.charisma + attrs.integrity) / 7 - 0.5;
      g.elections.momentum = clamp(g.elections.momentum + gain, -25, 25);
      record(
        g,
        'election',
        a.name,
        `${action.strategy === 'fundraising' ? 'Doações individuais reforçam o caixa dentro das regras da simulação.' : `Mobilização eleitoral ${gain >= 0 ? '+' : ''}${gain.toFixed(1)} pontos, conforme atributos, alcance e preparo.`} Custo: R$ ${a.cost} milhões.`,
      );
      message =
        action.strategy === 'fundraising'
          ? 'Arrecadação registrada no caixa de campanha.'
          : `Agenda realizada. Mobilização ${gain >= 0 ? '+' : ''}${gain.toFixed(1)} pontos.`;
      break;
    }
    case 'diplomacy': {
      if (!hasExecutiveAuthority(g))
        return reject('Acordos internacionais exigem autoridade executiva.');
      if (g.actions < 1 || g.capital < 10)
        return reject('Você precisa de uma ação e 10 pontos de capital político.');
      g.actions--;
      g.capital -= 10;
      const effect =
        action.approach === 'trade'
          ? { fdi: 2, growth: 0.12 }
          : action.approach === 'climate'
            ? { fdi: 1.5, infrastructure: 1 }
            : { governors: 3, stability: 1 };
      g.delayed.push({ due: g.turn + 3, effects: effect, source: 'Agenda internacional' });
      g.metrics.balance -= 0.08;
      record(
        g,
        'government',
        'Agenda internacional pactuada',
        `Cooperação ${action.approach === 'trade' ? 'comercial' : action.approach === 'climate' ? 'ambiental' : 'regional'}: efeitos esperados em três meses; custo fiscal de 0,08 p.p.`,
      );
      message = 'Acordo registrado. Os resultados chegam em três meses.';
      break;
    }
    case 'runoff': {
      if (g.elections.phase !== 'runoff') return reject('Não há segundo turno pendente.');
      finishElection(g, true);
      message = g.elections.won
        ? 'Vitória no segundo turno.'
        : 'A oposição venceu o segundo turno.';
      break;
    }
  }
  return { game: g, message };
}
