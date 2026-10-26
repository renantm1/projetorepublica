import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  FileText,
  Handshake,
  Landmark,
  Scale,
  TrendingUp,
  Users,
  ShieldCheck,
  Globe2,
  Leaf,
  Download,
  Upload,
  Save,
  Flag,
  ChevronRight,
  Search,
  CalendarDays,
  AlertTriangle,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel, Bar, Delta, Empty, Modal } from './ui';
import { TrendChart, Hemicycle } from './Charts';
import { BrazilMap } from './BrazilMap';
import {
  ATTRIBUTES,
  GROUPS,
  IDEOLOGIES,
  METRIC_LABELS,
  PARTIES,
  POLICIES,
  REGIONS,
  dateLabel,
  number,
} from '../engine/data';
import { coalitionSeats, forecast, partySupport } from '../engine/legislature';
import { CAMPAIGN_ACTIONS, nationalPoll, poll, regionalApproval } from '../engine/election';
import { useGame } from '../store';
import type { Game, MetricKey } from '../engine/types';
export function Economy({ game: g }: { game: Game }) {
  const [metric, setMetric] = useState<'growth' | 'inflation' | 'debt'>('growth');
  const first = g.series[0];
  const units: Partial<Record<MetricKey, string>> = {
    gdp: 'R$ tri',
    growth: '%',
    inflation: '%',
    selic: '%',
    unemployment: '%',
    debt: '% PIB',
    balance: '% PIB',
    fdi: 'US$ bi',
    exchange: 'R$/US$',
    income: 'R$',
  };
  const keys: MetricKey[] = [
    'gdp',
    'growth',
    'inflation',
    'selic',
    'unemployment',
    'debt',
    'balance',
    'fdi',
    'exchange',
    'income',
  ];
  return (
    <>
      <div className="page-note">
        <TrendingUp size={16} />
        <span>
          Indicadores interligados, com efeitos defasados. A política monetária é conduzida por um
          Banco Central autônomo.
        </span>
      </div>
      <div className="metric-grid">
        {keys.map((k) => (
          <div className="metric-card" key={k}>
            <span>{METRIC_LABELS[k]}</span>
            <strong>
              {number(g.metrics[k], k === 'exchange' || k === 'gdp' ? 2 : k === 'income' ? 0 : 1)}
              <small>{units[k]}</small>
            </strong>
            <p>
              {k === 'balance'
                ? g.metrics[k] >= 0
                  ? 'Superávit primário'
                  : 'Déficit primário'
                : k === 'fdi'
                  ? 'Fluxo anual estimado'
                  : k === 'income'
                    ? 'Renda mensal do trabalho'
                    : 'Cenário simulado'}
            </p>
          </div>
        ))}
      </div>
      <div className="two-columns">
        <Panel
          title="Trajetória macroeconômica"
          action={
            <select
              aria-label="Indicador do gráfico"
              value={metric}
              onChange={(e) => setMetric(e.target.value as typeof metric)}
            >
              <option value="growth">Crescimento</option>
              <option value="inflation">Inflação</option>
              <option value="debt">Dívida pública</option>
            </select>
          }
        >
          <div className="chart-summary">
            <div>
              <strong>
                {number(g.metrics[metric])}
                <small>%</small>
              </strong>
              <span>Valor atual</span>
            </div>
            <div>
              <Delta value={g.metrics[metric] - first[metric]} inverse={metric !== 'growth'} />
              <span>desde a posse</span>
            </div>
          </div>
          <TrendChart game={g} metric={metric} compare={false} />
        </Panel>
        <Panel title="A conta das escolhas" eyebrow="ORÇAMENTO PÚBLICO">
          <div className="budget-total">
            <span>Resultado primário anual</span>
            <strong className={g.metrics.balance < 0 ? 'negative' : 'positive'}>
              {g.metrics.balance > 0 ? '+' : ''}
              {number(g.metrics.balance)}
              <small>% do PIB</small>
            </strong>
          </div>
          <div className="budget-lines">
            {POLICIES.filter((p) => g.policies[p.id]).map((p) => (
              <div key={p.id}>
                <span>{p.name}</span>
                <strong className={p.cost > 0 ? 'negative' : 'positive'}>
                  {p.cost > 0 ? '−' : '+'}
                  {number(Math.abs(p.cost) * (g.policies[p.id] ?? 0), 2)} p.p.
                </strong>
              </div>
            ))}
            {!Object.values(g.policies).some(Boolean) && (
              <p className="muted">
                Nenhuma nova política em execução. O orçamento inicial apresenta déficit de 1,2% do
                PIB.
              </p>
            )}
          </div>
          <p className="help">
            Despesas continuam após a aprovação. Negociações e emergências também afetam o
            resultado. Dívida, juros e crescimento determinam a capacidade de financiar o governo.
          </p>
        </Panel>
      </div>
    </>
  );
}
export function Presidency({ game: g, onDecision }: { game: Game; onDecision: () => void }) {
  const social: MetricKey[] = [
    'poverty',
    'inequality',
    'security',
    'education',
    'health',
    'infrastructure',
    'trust',
    'stability',
    'governors',
    'pressure',
  ];
  return (
    <>
      <div className="president-profile">
        <div className="large-monogram">
          {g.profile.firstName[0]}
          {g.profile.lastName[0]}
        </div>
        <div>
          <span className="eyebrow gold-text">PRESIDÊNCIA DA REPÚBLICA</span>
          <h2>
            {g.profile.firstName} {g.profile.lastName}
          </h2>
          <p>
            {g.profile.party} · {g.profile.state} · {g.profile.age + Math.floor(g.turn / 12)} anos ·{' '}
            {g.profile.background}
          </p>
          <div className="profile-tags">
            <span className="tag">{IDEOLOGIES[g.profile.ideology + 3]}</span>
            <span className="tag">{g.profile.difficulty}</span>
            <span className="tag">Mandato 2027–2030</span>
          </div>
        </div>
        <div className="president-capital">
          <span className="eyebrow">CAPITAL POLÍTICO</span>
          <strong>
            {number(g.capital, 0)}
            <small>/100</small>
          </strong>
          <Bar value={g.capital} />
        </div>
      </div>
      <div className="two-columns">
        <Panel title="O país além do PIB" eyebrow="INDICADORES SOCIAIS">
          <div className="social-indicators">
            {social.map((k) => (
              <div key={k}>
                <span>{METRIC_LABELS[k]}</span>
                <strong>
                  {number(g.metrics[k], k === 'inequality' ? 3 : 1)}
                  {k === 'poverty' ? '%' : k === 'inequality' ? '' : ' / 100'}
                </strong>
                {k !== 'inequality' && (
                  <Bar
                    value={g.metrics[k]}
                    color={['poverty', 'pressure'].includes(k) ? 'red' : 'teal'}
                  />
                )}
              </div>
            ))}
          </div>
        </Panel>
        <div className="stack">
          <Panel title="Quem aprova seu governo" eyebrow="GRUPOS SOCIAIS">
            <div className="group-list">
              {Object.entries(GROUPS).map(([key, name]) => (
                <div key={key}>
                  <div>
                    <span>{name}</span>
                    <strong>{number(g.groups[key])}%</strong>
                  </div>
                  <Bar value={g.groups[key]} color={g.groups[key] >= 50 ? 'teal' : 'gold'} />
                </div>
              ))}
            </div>
            <p className="help">
              Os grupos reagem a emprego, renda, serviços, investimento e confiança. Nenhum grupo
              representa todo o eleitorado.
            </p>
          </Panel>
          <Panel title="Seu gabinete">
            <div className="attribute-pills">
              {ATTRIBUTES.map((a) => (
                <div key={a.id}>
                  <span>{a.name}</span>
                  <strong>
                    {g.profile.attributes[a.id]}
                    <small>/10</small>
                  </strong>
                </div>
              ))}
            </div>
            {g.eventId && (
              <button className="button primary full" onClick={onDecision}>
                Resolver decisão pendente <ArrowRight size={15} />
              </button>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
export function Policies({ game: g }: { game: Game }) {
  const act = useGame((s) => s.act);
  const nav = useGame((s) => s.setScreen);
  const [area, setArea] = useState('Todas');
  const busy = !!g.bill && ['debate', 'senate', 'veto'].includes(g.bill.status);
  return (
    <>
      <div className="page-note">
        <Scale size={17} />
        <span>
          Cada ampliação precisa de aprovação legislativa. Custos são anuais, em pontos percentuais
          do PIB; benefícios aparecem após a implementação.
        </span>
      </div>
      <div className="filter-row">
        {[
          'Todas',
          'Economia',
          'Saúde',
          'Educação',
          'Proteção social',
          'Infraestrutura',
          'Segurança',
          'Meio ambiente',
        ].map((a) => (
          <button
            className={`filter-chip ${area === a ? 'active' : ''}`}
            key={a}
            onClick={() => setArea(a)}
          >
            {a}
          </button>
        ))}
      </div>
      {busy && (
        <div className="notice">
          <FileText size={16} />
          <span>Há um projeto em tramitação. Conclua a votação antes de propor outro.</span>
          <button className="text-button" onClick={() => nav('congress')}>
            Ir ao Congresso <ArrowRight size={14} />
          </button>
        </div>
      )}
      <div className="policy-grid">
        {POLICIES.filter((p) => area === 'Todas' || p.area === area).map((p, i) => {
          const level = g.policies[p.id] ?? 0;
          return (
            <Panel key={p.id} className="policy-card">
              <div className="policy-top">
                <span className="eyebrow">{p.area}</span>
                <span className="policy-number">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <div className="policy-effects">
                {Object.entries(p.effects)
                  .filter(([k]) => k !== 'balance')
                  .map(([k, v]) => (
                    <span key={k}>
                      {METRIC_LABELS[k as MetricKey]}{' '}
                      <strong>
                        {v > 0 ? '+' : ''}
                        {number(v, Math.abs(v) < 0.01 ? 3 : 2)}
                      </strong>
                    </span>
                  ))}
              </div>
              <div className="policy-data">
                <span>
                  Custo anual{' '}
                  <strong>
                    {p.cost < 0 ? 'Receita +' : '−'}
                    {number(Math.abs(p.cost), 2)}% PIB
                  </strong>
                </span>
                <span>
                  Implementação <strong>{p.lag} meses</strong>
                </span>
                <span>
                  Proposição <strong>{p.capital} CP</strong>
                </span>
              </div>
              <div className="policy-level">
                <span>Intensidade aprovada</span>
                <div>
                  {[1, 2, 3].map((n) => (
                    <i className={level >= n ? 'filled' : level > n - 1 ? 'half' : ''} key={n} />
                  ))}
                </div>
                <strong>{number(level, level % 1 ? 1 : 0)}/3</strong>
              </div>
              {g.implementations.some((item) => item.policyId === p.id) && (
                <p className="implementation-note">
                  Em implantação até{' '}
                  {dateLabel(g.implementations.find((item) => item.policyId === p.id)!.due)} · nível
                  em execução: {number(g.activePolicies[p.id] ?? 0, 1)}
                </p>
              )}
              <div className="policy-actions">
                <button
                  className="button primary"
                  disabled={
                    busy || level >= 3 || g.capital < p.capital || g.actions < 1 || g.finished
                  }
                  onClick={() => {
                    act({
                      type: 'propose',
                      policy: p.id,
                      level: Math.min(3, Math.floor(level) + 1),
                    });
                    nav('congress');
                  }}
                >
                  Propor ampliação <ArrowUpRight size={14} />
                </button>
                {level > 0 && (
                  <button
                    className="button"
                    disabled={busy || g.capital < p.capital || g.actions < 1 || g.finished}
                    onClick={() => {
                      act({
                        type: 'propose',
                        policy: p.id,
                        level: Math.max(0, Math.ceil(level) - 1),
                      });
                      nav('congress');
                    }}
                  >
                    Reduzir
                  </button>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
      <p className="help">
        Efeitos descritos por mês e por nível, sujeitos à capacidade de execução. Emendas reduzem a
        intensidade em meio nível. A revisão de despesas pode melhorar o fiscal e enfraquecer
        serviços.
      </p>
    </>
  );
}
export function Congress({ game: g }: { game: Game }) {
  const act = useGame((s) => s.act);
  const nav = useGame((s) => s.setScreen);
  const [senate, setSenate] = useState(false);
  const [negotiation, setNegotiation] = useState<string | null>(null);
  const seats = coalitionSeats(g);
  const bill = g.bill;
  const policy = POLICIES.find((p) => p.id === bill?.policyId);
  const total = senate ? 81 : 513;
  const support = forecast(g, senate);
  return (
    <>
      <div className="congress-top">
        <Panel
          title="O plenário"
          eyebrow="PODER LEGISLATIVO"
          action={
            <div className="segmented">
              <button className={!senate ? 'active' : ''} onClick={() => setSenate(false)}>
                Câmara
              </button>
              <button className={senate ? 'active' : ''} onClick={() => setSenate(true)}>
                Senado
              </button>
            </div>
          }
        >
          <Hemicycle game={g} senate={senate} />
          <div className="chamber-stats">
            <div>
              <strong>{total}</strong>
              <span>Cadeiras</span>
            </div>
            <div>
              <strong className="gold-text">{support}</strong>
              <span>Apoio estimado</span>
            </div>
            <div>
              <strong>{senate ? 41 : 257}</strong>
              <span>Maioria necessária</span>
            </div>
          </div>
          <p className="help">
            Previsão sujeita à disciplina partidária. Modelo simplificado: quórum pleno e maioria
            absoluta nas duas Casas para leis ordinárias.
          </p>
        </Panel>
        <Panel title="Mesa legislativa" eyebrow="PROJETO EM TRAMITAÇÃO">
          {bill && policy ? (
            <>
              <div className="bill-meta">
                <span className="tag">
                  PL {g.history.filter((h) => h.title === 'Projeto protocolado').length}/2027
                </span>
                <span className="tag">
                  {bill.status === 'debate'
                    ? 'CÂMARA'
                    : bill.status === 'senate'
                      ? 'SENADO'
                      : bill.status === 'veto'
                        ? 'SANÇÃO'
                        : bill.status === 'approved'
                          ? 'EM VIGOR'
                          : bill.status === 'rejected'
                            ? 'REJEITADO'
                            : 'VETADO'}
                </span>
              </div>
              <h3 className="bill-title">{policy.name}</h3>
              <p className="muted">
                Intensidade proposta: {bill.level}/3.{' '}
                {bill.amendment ? 'Texto moderado por emenda.' : 'Texto original do Executivo.'}
              </p>
              <div className="bill-stages">
                {['Câmara', 'Senado', 'Sanção'].map((s, i) => (
                  <div
                    key={s}
                    className={
                      bill.status === 'approved' ||
                      (bill.status === 'veto' && i < 2) ||
                      (bill.status === 'senate' && i < 1)
                        ? 'done'
                        : ''
                    }
                  >
                    <span>
                      {i === 0 && bill.deputies !== undefined
                        ? `${bill.deputies}/513`
                        : i === 1 && bill.senators !== undefined
                          ? `${bill.senators}/81`
                          : String(i + 1).padStart(2, '0')}
                    </span>
                    <strong>{s}</strong>
                  </div>
                ))}
              </div>
              {['debate', 'senate'].includes(bill.status) && (
                <div className="bill-forecast">
                  <span>Previsão na {bill.status === 'debate' ? 'Câmara' : 'Casa revisora'}</span>
                  <strong
                    className={
                      forecast(g, bill.status === 'senate') >= (bill.status === 'senate' ? 41 : 257)
                        ? 'positive'
                        : 'negative'
                    }
                  >
                    {forecast(g, bill.status === 'senate')} votos
                  </strong>
                </div>
              )}
              <div className="bill-buttons">
                {bill.status === 'debate' && (
                  <>
                    <button
                      className="button primary"
                      disabled={g.finished}
                      onClick={() => act({ type: 'vote' })}
                    >
                      Votar na Câmara <Landmark size={15} />
                    </button>
                    <button
                      className="button"
                      disabled={bill.amendment || g.capital < 4 || g.finished}
                      onClick={() => act({ type: 'amend' })}
                    >
                      Moderar texto · 4 CP
                    </button>
                  </>
                )}
                {bill.status === 'senate' && (
                  <button
                    className="button primary"
                    disabled={g.finished}
                    onClick={() => act({ type: 'vote' })}
                  >
                    Votar no Senado <Landmark size={15} />
                  </button>
                )}
                {bill.status === 'veto' && (
                  <>
                    <button
                      className="button primary"
                      disabled={g.finished}
                      onClick={() => act({ type: 'veto', veto: false })}
                    >
                      Sancionar lei <Check size={15} />
                    </button>
                    <button
                      className="button"
                      disabled={g.finished || g.capital < 8}
                      onClick={() => act({ type: 'veto', veto: true })}
                    >
                      Vetar texto
                    </button>
                  </>
                )}
                {['approved', 'rejected', 'vetoed'].includes(bill.status) && (
                  <button className="button" onClick={() => nav('policies')}>
                    Escolher nova proposta <ArrowRight size={14} />
                  </button>
                )}
              </div>
              {bill.status === 'veto' && (
                <p className="help">
                  Vetar custa 8 CP. O Congresso pode derrubar o veto se houver maioria nas duas
                  Casas.
                </p>
              )}
            </>
          ) : (
            <Empty
              title="A pauta está aberta"
              detail="Escolha uma política pública para iniciar a tramitação. O apoio de sua base depende do conteúdo do projeto."
            />
          )}
          {!bill && (
            <button className="button primary full" onClick={() => nav('policies')}>
              Apresentar projeto <ArrowRight size={15} />
            </button>
          )}
        </Panel>
      </div>
      <Panel
        title="Bancadas & articulação"
        action={
          <span className="muted tiny">
            {seats} cadeiras na base · {g.actions} ações disponíveis
          </span>
        }
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Partido</th>
                <th>Posição</th>
                <th>Câmara</th>
                <th>Senado</th>
                <th>Relação</th>
                <th>Apoio ao texto</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {PARTIES.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="party-cell">
                      <span
                        className="party-badge"
                        style={{ color: p.color, borderColor: p.color + '66' }}
                      >
                        {p.id}
                      </span>
                      <div>
                        <strong>{p.name}</strong>
                        <small>
                          {g.coalition.includes(p.id)
                            ? 'Base governista'
                            : 'Independente / oposição'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{IDEOLOGIES[p.ideology + 3]}</td>
                  <td className="tabular">{p.seats}</td>
                  <td className="tabular">{p.senate}</td>
                  <td>
                    <div className="table-meter">
                      <Bar value={g.relations[p.id]} />
                      <span>{number(g.relations[p.id], 0)}</span>
                    </div>
                  </td>
                  <td className="tabular">{number(partySupport(g, p) * 100, 0)}%</td>
                  <td>
                    <button
                      className="button compact"
                      disabled={g.actions < 1 || g.capital < 5 || g.finished}
                      onClick={() => setNegotiation(p.id)}
                    >
                      <Handshake size={14} /> Negociar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      {negotiation && (
        <Modal title={`Negociar com ${negotiation}`} onClose={() => setNegotiation(null)}>
          <p className="modal-intro">
            Escolha uma forma de aproximação. Todas consomem uma ação; a negociação melhora a
            relação, sem garantir disciplina de voto.
          </p>
          <div className="choice-list">
            {(
              [
                {
                  key: 'dialogue',
                  title: 'Diálogo institucional',
                  cost: 5,
                  detail:
                    'Ouça as prioridades da bancada. Melhora a relação sem compromisso fiscal.',
                },
                {
                  key: 'agenda',
                  title: 'Pacto de agenda',
                  cost: 9,
                  detail:
                    'Acorde prioridades legislativas. Ganho de relação maior e entrada na coalizão se a afinidade atingir 68.',
                },
                {
                  key: 'budget',
                  title: 'Prioridade orçamentária transparente',
                  cost: 6,
                  detail:
                    'Comprometa recursos públicos com as demandas da bancada: resultado fiscal −0,12 p.p., confiança −0,5.',
                },
              ] as const
            ).map((o) => (
              <button
                className="choice"
                key={o.key}
                disabled={g.capital < o.cost || g.actions < 1}
                onClick={() => {
                  act({ type: 'negotiate', party: negotiation, approach: o.key });
                  setNegotiation(null);
                }}
              >
                <span>
                  <strong>{o.title}</strong>
                  <small>{o.detail}</small>
                </span>
                <b>
                  {o.cost} CP <ChevronRight size={15} />
                </b>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
export function Elections({ game: g }: { game: Game }) {
  const act = useGame((s) => s.act);
  const [confirm, setConfirm] = useState<keyof typeof CAMPAIGN_ACTIONS | null>(null);
  const results =
    g.elections.phase === 'complete'
      ? g.elections.runoff.length
        ? g.elections.runoff
        : g.elections.firstRound
      : nationalPoll(g, g.elections.phase === 'runoff');
  const player = results.find((r) => r.id === 'player');
  const finalist =
    g.elections.phase !== 'runoff' ||
    g.elections.firstRound.slice(0, 2).some((c) => c.id === 'player');
  return (
    <>
      <div className={`election-banner ${g.elections.phase === 'complete' ? 'complete' : ''}`}>
        <Flag size={24} />
        <div>
          <span className="eyebrow">ELEIÇÕES PRESIDENCIAIS · OUTUBRO DE 2030</span>
          <h2>
            {g.elections.phase === 'runoff'
              ? 'A decisão vai ao segundo turno.'
              : g.elections.phase === 'complete'
                ? g.elections.won
                  ? 'As urnas confirmaram sua continuidade.'
                  : 'A democracia segue. Seu legado permanece.'
                : 'O mandato também se disputa nas urnas.'}
          </h2>
          <p>
            {g.elections.phase === 'runoff'
              ? finalist
                ? 'Faça até duas ações extras de campanha e conclua a apuração.'
                : 'Sua candidatura ficou fora do segundo turno. Acompanhe a decisão dos eleitores.'
              : g.elections.phase === 'complete'
                ? 'Resultados ponderados pelo eleitorado estadual, pelas condições do governo e pela campanha.'
                : `Faltam ${Math.max(0, 45 - g.turn)} meses até o primeiro turno. Governar bem é uma parte da campanha.`}
          </p>
        </div>
        {g.elections.phase === 'runoff' && (
          <button className="button primary" onClick={() => act({ type: 'runoff' })}>
            Apurar 2º turno <ArrowRight size={15} />
          </button>
        )}
      </div>
      <div className="election-stats">
        <div>
          <span>Seu apoio {g.elections.phase === 'complete' ? 'nas urnas' : 'na pesquisa'}</span>
          <strong>
            {number(player?.share ?? 0)}
            <small>%</small>
          </strong>
        </div>
        <div>
          <span>Caixa de campanha</span>
          <strong>
            <small>R$ </small>
            {number(g.elections.funds)}
            <small> mi</small>
          </strong>
        </div>
        <div>
          <span>Mobilização</span>
          <strong>
            {g.elections.momentum >= 0 ? '+' : ''}
            {number(g.elections.momentum)}
            <small> pts</small>
          </strong>
        </div>
        <div>
          <span>Agendas eleitorais</span>
          <strong>
            {g.elections.actionsThisTurn}
            <small>/2 neste mês</small>
          </strong>
        </div>
      </div>
      <div className="two-columns">
        <Panel
          title={g.elections.phase === 'complete' ? 'Resultado da apuração' : 'Intenção de voto'}
          eyebrow={g.elections.phase === 'runoff' ? 'SEGUNDO TURNO' : 'VOTOS VÁLIDOS'}
        >
          <div className="poll-list">
            {results.map((c, i) => {
              const party = PARTIES.find((p) => p.id === c.party)!;
              return (
                <div
                  key={c.id}
                  className={`poll-candidate ${c.id === 'player' ? 'is-player' : ''}`}
                >
                  <span className="poll-rank">0{i + 1}</span>
                  <div className="poll-info">
                    <div>
                      <strong>
                        {c.name} {c.id === 'player' && <small>VOCÊ</small>}
                      </strong>
                      <b>{number(c.share)}%</b>
                    </div>
                    <span>
                      {party.id} · {party.name}
                    </span>
                    <Bar value={c.share} color={c.id === 'player' ? 'gold' : 'blue'} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="help">
            {g.elections.phase === 'complete'
              ? 'Apuração da simulação. A pequena variação frente à pesquisa é reproduzível pela seed.'
              : 'Modelo segmentado por estado, renda, desenvolvimento e afinidade econômica e social. Margem de incerteza simulada: ±1,4 p.p. Os votos são normalizados por estado.'}
          </p>
          {g.elections.firstRound.length > 0 && g.elections.phase !== 'campaign' && (
            <details>
              <summary>Consultar primeiro turno</summary>
              <div className="results-mini">
                {g.elections.firstRound.map((c) => (
                  <div key={c.id}>
                    <span>{c.name}</span>
                    <strong>{number(c.share)}%</strong>
                  </div>
                ))}
              </div>
            </details>
          )}
        </Panel>
        <Panel title="Comando de campanha" eyebrow="ESTRATÉGIA ELEITORAL">
          <div className="campaign-actions">
            {Object.entries(CAMPAIGN_ACTIONS).map(([key, a]) => (
              <button
                key={key}
                className="campaign-action"
                disabled={
                  !finalist ||
                  g.elections.phase === 'complete' ||
                  g.elections.actionsThisTurn >= 2 ||
                  g.actions < 1 ||
                  g.elections.funds < a.cost ||
                  g.capital < a.capital ||
                  g.finished
                }
                onClick={() => setConfirm(key as keyof typeof CAMPAIGN_ACTIONS)}
              >
                <span className="campaign-action-icon">
                  {key === 'debate' ? (
                    <Users size={18} />
                  ) : key === 'advertising' ? (
                    <Flag size={18} />
                  ) : key === 'visit' ? (
                    <Globe2 size={18} />
                  ) : key === 'interview' ? (
                    <FileText size={18} />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                </span>
                <span>
                  <strong>{a.name}</strong>
                  <small>
                    {a.cost ? `R$ ${a.cost} mi` : 'Sem custo financeiro'} · {a.capital} CP · 1 ação
                  </small>
                </span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Quem disputa com você" eyebrow="ADVERSÁRIOS EM MOVIMENTO">
        <div className="rivals-grid">
          {g.elections.rivals.map((c) => (
            <div className="rival" key={c.id}>
              <div className="rival-top">
                <div className="rival-monogram">
                  {c.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <span className="tag">{c.party}</span>
              </div>
              <h3>{c.name}</h3>
              <span className="muted tiny">
                {IDEOLOGIES[c.ideology + 3]} · {c.strategy}
              </span>
              <div className="rival-data">
                <span>
                  Popularidade <strong>{number(c.popularity, 0)}</strong>
                </span>
                <span>
                  Ambição <strong>{c.ambition}</strong>
                </span>
                <span>
                  Negociação <strong>{c.negotiation}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      {confirm && (
        <Modal title={CAMPAIGN_ACTIONS[confirm].name} onClose={() => setConfirm(null)}>
          <div className="prose">
            <p>{CAMPAIGN_ACTIONS[confirm].description}</p>
            <p>
              Custo: <strong>R$ {CAMPAIGN_ACTIONS[confirm].cost} milhões</strong>,{' '}
              <strong>{CAMPAIGN_ACTIONS[confirm].capital} CP</strong> e uma ação de agenda.
            </p>
            <p className="help">
              A mobilização perde força a cada mês. Investir cedo constrói presença, mas exige
              continuidade.
            </p>
            <button
              className="button primary full"
              onClick={() => {
                act({ type: 'campaign', strategy: confirm });
                setConfirm(null);
              }}
            >
              Realizar agenda <ArrowRight size={15} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function MapPage({ game: g, initialState }: { game: Game; initialState: string }) {
  const [selected, setSelected] = useState(initialState);
  const [query, setQuery] = useState('');
  const state = REGIONS.find((r) => r.uf === selected) ?? REGIONS[24];
  const votes = poll(g, state);
  const value = g.elections.resultsByState[state.uf];
  return (
    <>
      <div className="page-note">
        <Globe2 size={16} />
        <span>
          Contornos geográficos reais. Populações, eleitorados, renda e resultados são parâmetros
          fictícios deste cenário.
        </span>
      </div>
      <div className="map-page-grid">
        <Panel
          title="Um país, muitas escolhas"
          eyebrow={g.elections.firstRound.length ? 'RESULTADOS ELEITORAIS' : 'APROVAÇÃO REGIONAL'}
        >
          <BrazilMap game={g} selected={selected} onSelect={setSelected} />
          <div className="map-legend">
            <span>
              <i style={{ background: '#66444a' }} /> &lt; 30%
            </span>
            <span>
              <i style={{ background: '#805b57' }} /> 30–39%
            </span>
            <span>
              <i style={{ background: '#847e61' }} /> 40–49%
            </span>
            <span>
              <i style={{ background: '#476b69' }} /> 50–59%
            </span>
            <span>
              <i style={{ background: '#658e87' }} /> 60%+
            </span>
          </div>
          <p className="help">
            Selecione um estado no mapa ou na tabela. Cores representam{' '}
            {g.elections.firstRound.length
              ? 'sua votação na última apuração'
              : 'a avaliação do seu governo'}
            .
          </p>
        </Panel>
        <div className="stack">
          <Panel title={state.name} eyebrow={`${state.uf} / ${state.region.toUpperCase()}`}>
            <div className="state-approval">
              <strong>
                {number(value ?? regionalApproval(g, state))}
                <small>%</small>
              </strong>
              <span>
                {value !== undefined ? 'dos votos na última apuração' : 'de aprovação presidencial'}
              </span>
            </div>
            <div className="state-facts">
              <div>
                <span>População</span>
                <strong>{number(state.population, 2)} milhões</strong>
              </div>
              <div>
                <span>Eleitorado</span>
                <strong>{number(state.electorate, 2)} milhões</strong>
              </div>
              <div>
                <span>Renda média regional</span>
                <strong>R$ {number(state.income * (g.metrics.income / 3180), 0)}</strong>
              </div>
              <div>
                <span>Atividade econômica</span>
                <strong>{number(g.metrics.growth + (state.development - 50) * 0.01)}%</strong>
              </div>
              <div>
                <span>Partido líder na pesquisa</span>
                <strong>{votes[0].party}</strong>
              </div>
            </div>
            <h3 className="subheading">Intenção de voto no estado</h3>
            <div className="regional-polls">
              {votes.map((c) => (
                <div key={c.id}>
                  <div>
                    <span>
                      {c.party} {c.id === 'player' ? '· Você' : ''}
                    </span>
                    <strong>{number(c.share)}%</strong>
                  </div>
                  <Bar value={c.share} color={c.id === 'player' ? 'gold' : 'blue'} />
                </div>
              ))}
            </div>
            <p className="help">
              Histórico deste cenário:{' '}
              {value !== undefined
                ? `sua candidatura recebeu ${number(value)}% na última votação.`
                : 'a primeira eleição do mandato ainda não ocorreu.'}
            </p>
          </Panel>
        </div>
      </div>
      <Panel
        title="Panorama das unidades federativas"
        action={
          <label className="search-box">
            <Search size={14} />
            <input
              placeholder="Buscar estado…"
              aria-label="Buscar estado"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        }
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Região</th>
                <th>Eleitorado</th>
                <th>Aprovação</th>
                <th>Seu voto estimado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {REGIONS.filter((r) =>
                `${r.name} ${r.uf}`
                  .toLocaleLowerCase('pt-BR')
                  .includes(query.toLocaleLowerCase('pt-BR')),
              ).map((r) => (
                <tr key={r.uf} className={r.uf === selected ? 'selected-row' : ''}>
                  <td>
                    <strong>{r.uf}</strong> <span className="muted">{r.name}</span>
                  </td>
                  <td>{r.region}</td>
                  <td>{number(r.electorate, 2)} mi</td>
                  <td>{number(regionalApproval(g, r))}%</td>
                  <td>{number(poll(g, r).find((c) => c.id === 'player')?.share ?? 0)}%</td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Selecionar ${r.name}`}
                      onClick={() => setSelected(r.uf)}
                    >
                      <ArrowUpRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!REGIONS.some((r) =>
            `${r.name} ${r.uf}`
              .toLocaleLowerCase('pt-BR')
              .includes(query.toLocaleLowerCase('pt-BR')),
          ) && <p className="help">Nenhum estado corresponde à busca.</p>}
        </div>
      </Panel>
    </>
  );
}
export function Parties({ game: g }: { game: Game }) {
  const nav = useGame((s) => s.setScreen);
  return (
    <>
      <div className="page-note">
        <Users size={16} />
        <span>
          Oito partidos fictícios representam diferentes interesses. Afinidade ideológica facilita o
          diálogo; não substitui a negociação.
        </span>
      </div>
      <div className="parties-grid">
        {PARTIES.map((p) => (
          <Panel key={p.id} className="party-card">
            <div className="party-card-top">
              <span className="large-party" style={{ color: p.color }}>
                {p.id}
              </span>
              <span className={`tag ${g.coalition.includes(p.id) ? 'gold-text' : ''}`}>
                {p.id === g.profile.party
                  ? 'SEU PARTIDO'
                  : g.coalition.includes(p.id)
                    ? 'BASE'
                    : 'INDEPENDENTE'}
              </span>
            </div>
            <h2>{p.name}</h2>
            <p className="muted">
              {p.leader} · {IDEOLOGIES[p.ideology + 3]}
            </p>
            <div className="party-seats">
              <div>
                <strong>{p.seats}</strong>
                <span>Deputados</span>
              </div>
              <div>
                <strong>{p.senate}</strong>
                <span>Senadores</span>
              </div>
              <div>
                <strong>{number(g.relations[p.id], 0)}</strong>
                <span>Relação</span>
              </div>
            </div>
            <Bar value={g.relations[p.id]} color="blue" />
            <p className="help">
              Economia:{' '}
              {p.economic < 0
                ? 'maior intervenção estatal'
                : p.economic > 0
                  ? 'maior liberdade de mercado'
                  : 'economia mista'}
              . Apoio estimado ao texto atual: {number(partySupport(g, p) * 100, 0)}%.
            </p>
            <button className="button full" onClick={() => nav('congress')}>
              <Handshake size={14} /> Abrir articulação parlamentar <ArrowRight size={14} />
            </button>
          </Panel>
        ))}
      </div>
    </>
  );
}
export function Newspaper({ game: g }: { game: Game }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const entries = g.history.filter((h) => filter === 'all' || h.type === filter);
  const lead = entries[0];
  return (
    <div className="newspaper">
      <div className="newspaper-masthead">
        <div>
          <span>INDEPENDÊNCIA PARA ACOMPANHAR O PODER</span>
          <strong>Jornal da República</strong>
          <div>
            <span>EDIÇÃO DA SIMULAÇÃO · Nº {String(g.turn + 1).padStart(3, '0')}</span>
            <span>{dateLabel(g.turn).toLocaleUpperCase('pt-BR')}</span>
          </div>
        </div>
      </div>
      <nav className="newspaper-nav">
        {[
          { id: 'all', label: 'Últimas notícias' },
          { id: 'government', label: 'Governo' },
          { id: 'economy', label: 'Economia' },
          { id: 'congress', label: 'Congresso' },
          { id: 'election', label: 'Eleições' },
          { id: 'event', label: 'Decisões' },
        ].map((c) => (
          <button
            key={c.id}
            className={filter === c.id ? 'active' : ''}
            onClick={() => {
              setFilter(c.id);
              setExpanded(null);
            }}
          >
            {c.label}
          </button>
        ))}
      </nav>
      {lead ? (
        <>
          <article className="newspaper-lead">
            <span className="eyebrow">
              {lead.type === 'economy'
                ? 'CONJUNTURA'
                : lead.type === 'congress'
                  ? 'PODER LEGISLATIVO'
                  : 'VIDA PÚBLICA'}{' '}
              / {dateLabel(lead.turn)}
            </span>
            <h2>{lead.title}</h2>
            <p>{lead.detail.replace(/\[.*?\]\s*/g, '')}</p>
            <span className="tiny muted">Redação · Brasília · fatos da sua simulação</span>
          </article>
          <div className="newspaper-articles">
            {entries.slice(1).map((h) => (
              <article key={h.id}>
                <span className="eyebrow">{dateLabel(h.turn, true)}</span>
                <h3>
                  <button onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
                    {h.title}
                  </button>
                </h3>
                <p>
                  {expanded === h.id
                    ? h.detail.replace(/\[.*?\]\s*/g, '')
                    : h.detail.replace(/\[.*?\]\s*/g, '').slice(0, 140) +
                      (h.detail.length > 140 ? '…' : '')}
                </p>
                <button
                  className="text-button"
                  onClick={() => setExpanded(expanded === h.id ? null : h.id)}
                >
                  {expanded === h.id ? 'Recolher' : 'Ler notícia'} <ArrowRight size={12} />
                </button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <Empty
          title="Ainda sem notícias nesta editoria"
          detail="As manchetes serão publicadas conforme acontecimentos da sua campanha."
        />
      )}
    </div>
  );
}
export function Diplomacy({ game: g }: { game: Game }) {
  const act = useGame((s) => s.act);
  const [confirm, setConfirm] = useState<'trade' | 'climate' | 'regional' | null>(null);
  const agendas = [
    {
      id: 'trade' as const,
      name: 'Abrir novos mercados',
      icon: Globe2,
      region: 'COMÉRCIO & INVESTIMENTO',
      text: 'Negocie acesso comercial e atraia investimento. O acordo amadurece com a confiança e a capacidade produtiva do país.',
      result: 'Investimento +US$ 2 bi · crescimento +0,12 p.p.',
    },
    {
      id: 'climate' as const,
      name: 'Diplomacia do clima',
      icon: Leaf,
      region: 'COOPERAÇÃO AMBIENTAL',
      text: 'Construa parcerias para energia limpa e infraestrutura resiliente. Resultados exigem continuidade da agenda.',
      result: 'Investimento +US$ 1,5 bi · infraestrutura +1',
    },
    {
      id: 'regional' as const,
      name: 'Uma agenda sul-americana',
      icon: Handshake,
      region: 'INTEGRAÇÃO REGIONAL',
      text: 'Articule cooperação nas fronteiras e nos corredores logísticos com governadores e países vizinhos.',
      result: 'Governadores +3 · estabilidade +1',
    },
  ];
  return (
    <>
      <div className="diplomacy-hero">
        <Globe2 size={48} strokeWidth={0.7} />
        <div>
          <span className="eyebrow gold-text">O BRASIL NO MUNDO</span>
          <h2>Influência se constrói com continuidade.</h2>
          <p>
            Agendas diplomáticas têm custo fiscal e prazo de maturação. Choques externos também
            chegam à sua mesa por meio dos eventos.
          </p>
        </div>
      </div>
      <div className="three-columns">
        {agendas.map((a) => (
          <Panel className="diplomacy-card" key={a.id}>
            <a.icon size={25} strokeWidth={1.2} />
            <span className="eyebrow">{a.region}</span>
            <h2>{a.name}</h2>
            <p>{a.text}</p>
            <div className="agreement-result">
              {a.result}
              <small>Após 3 meses · fiscal −0,08 p.p.</small>
            </div>
            <button
              className="button primary full"
              disabled={g.capital < 10 || g.actions < 1 || g.finished}
              onClick={() => setConfirm(a.id)}
            >
              Abrir negociação <ArrowUpRight size={14} />
            </button>
            <span className="tiny muted">10 CP · 1 ação</span>
          </Panel>
        ))}
      </div>
      <Panel title="Acordos em implementação" eyebrow="COMPROMISSOS ASSUMIDOS">
        {g.delayed.filter((d) => d.source === 'Agenda internacional').length ? (
          <div className="agreements">
            {g.delayed
              .filter((d) => d.source === 'Agenda internacional')
              .map((d, i) => (
                <div key={i}>
                  <Handshake size={17} />
                  <span>Acordo de cooperação · resultados em {dateLabel(d.due)}</span>
                  <span className="tag">EM IMPLEMENTAÇÃO</span>
                </div>
              ))}
          </div>
        ) : (
          <Empty
            title="Nenhum acordo pendente"
            detail="Uma agenda internacional leva três meses para produzir seus primeiros efeitos."
          />
        )}
      </Panel>
      {confirm && (
        <Modal title="Confirmar compromisso internacional" onClose={() => setConfirm(null)}>
          <div className="prose">
            <p>
              {agendas.find((a) => a.id === confirm)?.name}: consome uma ação, 10 pontos de capital
              político e 0,08 p.p. de resultado fiscal.
            </p>
            <p>
              Resultados previstos em três meses: {agendas.find((a) => a.id === confirm)?.result}.
            </p>
            <button
              className="button primary full"
              onClick={() => {
                act({ type: 'diplomacy', approach: confirm });
                setConfirm(null);
              }}
            >
              Firmar acordo <Check size={15} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function History({ game: g }: { game: Game }) {
  const [filter, setFilter] = useState('all');
  return (
    <>
      <div className="history-summary">
        <CalendarDays size={22} />
        <div>
          <strong>{g.history.length} acontecimentos registrados</strong>
          <span>
            Da posse até {dateLabel(g.turn)}. O histórico registra decisões, leis, efeitos e
            eleições.
          </span>
        </div>
        <select
          aria-label="Filtrar histórico"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todos os acontecimentos</option>
          <option value="event">Decisões</option>
          <option value="congress">Congresso</option>
          <option value="economy">Economia</option>
          <option value="election">Eleições</option>
          <option value="government">Governo</option>
        </select>
      </div>
      <div className="timeline">
        {g.history
          .filter((h) => filter === 'all' || h.type === filter)
          .map((h) => (
            <article className="timeline-entry" key={h.id}>
              <time>{dateLabel(h.turn, true)}</time>
              <div className="timeline-dot" />
              <div>
                <span className="eyebrow">
                  {h.type === 'congress'
                    ? 'CONGRESSO'
                    : h.type === 'economy'
                      ? 'ECONOMIA'
                      : h.type === 'event'
                        ? 'DECISÃO'
                        : h.type === 'election'
                          ? 'ELEIÇÃO'
                          : 'GOVERNO'}
                </span>
                <h3>{h.title}</h3>
                <p>{h.detail.replace(/\[.*?\]\s*/g, '')}</p>
              </div>
            </article>
          ))}
      </div>
      {!g.history.some((h) => filter === 'all' || h.type === filter) && (
        <Empty
          title="Nenhum registro nesta categoria"
          detail="Os acontecimentos aparecerão aqui conforme você joga."
        />
      )}
    </>
  );
}
export function GameSettings({
  game: g,
  onImport,
  onMenu,
  onHelp,
}: {
  game: Game;
  onImport: () => void;
  onMenu: () => void;
  onHelp: () => void;
}) {
  const { autosave, reducedMotion, setAutosave, setReducedMotion, save, savedAt, notify } =
    useGame();
  const [reset, setReset] = useState(false);
  const exportGame = () => {
    const blob = new Blob([JSON.stringify(g, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `republica-${g.profile.lastName.toLowerCase()}-mes-${g.turn + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Cópia da campanha exportada.');
  };
  return (
    <div className="settings-grid">
      <Panel title="Sua campanha" eyebrow="ARQUIVO DE GOVERNO">
        <div className="save-info">
          <Save size={22} />
          <div>
            <strong>
              {g.profile.firstName} {g.profile.lastName}
            </strong>
            <span>
              {dateLabel(g.turn)} · seed {g.seed}
            </span>
            <small>
              {savedAt
                ? `Último salvamento nesta sessão: ${savedAt}`
                : 'Use o salvamento manual ou exporte uma cópia.'}
            </small>
          </div>
        </div>
        <div className="settings-buttons">
          <button className="button primary" onClick={save}>
            <Save size={15} /> Salvar agora
          </button>
          <button className="button" onClick={exportGame}>
            <Download size={15} /> Exportar partida
          </button>
          <button className="button" onClick={onImport}>
            <Upload size={15} /> Importar partida
          </button>
        </div>
        <p className="help">
          O salvamento fica no navegador. A exportação cria um arquivo JSON que pode ser importado
          em outro dispositivo. Importar substitui o salvamento local após validar o arquivo.
        </p>
      </Panel>
      <Panel title="Preferências">
        <div className="settings-list">
          <label className="toggle-row">
            <div>
              <strong>Salvar automaticamente</strong>
              <span>Registra cada turno e decisão.</span>
            </div>
            <input
              type="checkbox"
              checked={autosave}
              onChange={(e) => setAutosave(e.target.checked)}
            />
          </label>
          <label className="toggle-row">
            <div>
              <strong>Reduzir movimento</strong>
              <span>Uma interface sem animações.</span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
          </label>
        </div>
      </Panel>
      <Panel title="Manual & cenário">
        <div className="settings-links">
          <button onClick={onHelp}>
            <BookOpen size={18} />
            <span>
              Como governar<strong>Regras, calendário e simplificações</strong>
            </span>
            <ChevronRight size={16} />
          </button>
          <button onClick={onMenu}>
            <ArrowRight size={18} />
            <span>
              Voltar ao menu<strong>O jogo permanece salvo conforme suas preferências</strong>
            </span>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setReset(true)}>
            <RotateCcw size={18} />
            <span>
              Nova campanha
              <strong>O salvamento atual será substituído ao assumir o novo mandato</strong>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </Panel>
      <Panel title="Sobre esta simulação">
        <div className="prose compact-prose">
          <p>
            REPÚBLICA v1.0 · campanha presidencial de quatro anos. Todos os valores são simulados,
            incluindo populações e pesquisas. Partidos e personagens são fictícios.
          </p>
          <p>
            O jogo não representa uma previsão econômica nem uma recomendação política. A seed
            controla a incerteza; suas decisões controlam os caminhos possíveis.
          </p>
          <p>
            Geografia: svg-maps / MapSVG, licença CC BY 4.0. Os caminhos vetoriais são mantidos em
            um arquivo local com rótulos adicionados. Sem rastreamento, contas ou serviços externos
            durante o jogo.
          </p>
        </div>
      </Panel>
      {reset && (
        <Modal title="Começar uma nova campanha?" onClose={() => setReset(false)}>
          <div className="prose">
            <p>
              Exporte sua partida se quiser preservá-la. O salvamento atual será substituído apenas
              quando você assumir um novo mandato.
            </p>
            <button
              className="button primary full"
              onClick={() => {
                setReset(false);
                onMenu();
              }}
            >
              Voltar ao menu para criar campanha <ArrowRight size={15} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
export function Manual({ onClose }: { onClose: () => void }) {
  const sections: { icon: ReactNode; title: string; text: string }[] = [
    {
      icon: <CalendarDays size={20} />,
      title: 'Um mês por turno',
      text: 'São 48 turnos, de janeiro de 2027 a dezembro de 2030. A cada mês, você recebe três ações de agenda e recupera capital político. Resolva a decisão pendente para avançar. A conclusão chega em janeiro de 2031.',
    },
    {
      icon: <Scale size={20} />,
      title: 'Transforme prioridades em leis',
      text: 'Em Políticas públicas, proponha uma ampliação ou redução. Negocie no Congresso, vote na Câmara (257 de 513), vote no Senado (41 de 81) e sancione. As duas Casas usam quórum pleno simplificado. Emendas reduzem o alcance e aumentam o apoio. Não são simuladas PECs ou regras especiais de quórum.',
    },
    {
      icon: <TrendingUp size={20} />,
      title: 'Custos imediatos, benefícios com atraso',
      text: 'As políticas têm até três níveis e custo anual recorrente. Saúde melhora com investimento; déficits e juros afetam a dívida. A opinião pública é formada por grupos com interesses diferentes. O Banco Central reage à inflação com autonomia. Efeitos econômicos são aproximações de jogo, não modelos preditivos.',
    },
    {
      icon: <Flag size={20} />,
      title: 'Uma eleição que reflete o mandato',
      text: 'O primeiro turno acontece em outubro de 2030. Sem maioria acima de 50%, os dois primeiros disputam um segundo turno no mesmo mês, com até duas ações extras de campanha. Pesquisas e votos consideram os 27 estados, renda, desenvolvimento, afinidades e mobilização. Adversários reagem ao desgaste do governo. Os grupos regionais agregam diferenças de idade e escolaridade; não há cadastro individual de eleitores.',
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'O que esta versão cobre',
      text: 'O MVP implementa a Presidência por quatro anos, negociação por bancadas, políticas, eventos, notícias, diplomacia e reeleição. Carreira em outros cargos, eleições legislativas proporcionais completas e vereadores individuais ficam para uma expansão. As relações com governadores são agregadas; não são 27 personagens independentes.',
    },
    {
      icon: <Save size={20} />,
      title: 'Preserve seu legado',
      text: 'O salvamento automático é local. Exporte cópias em Configurações. O mesmo número de seed e a mesma sequência de decisões reproduzem os mesmos resultados. Não há dados atuais do Brasil no cenário; os contornos estaduais são os únicos dados geográficos reais.',
    },
  ];
  return (
    <Modal title="Manual do gabinete" onClose={onClose} wide>
      <div className="manual-grid">
        {sections.map((s) => (
          <div key={s.title}>
            {s.icon}
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
      <div className="manual-footer">
        <AlertTriangle size={15} />
        <span>Cada caminho tem custos. Nenhuma ideologia recebe bônus automático no motor.</span>
      </div>
    </Modal>
  );
}
export function DecisionModal({ game: g, onClose }: { game: Game; onClose: () => void }) {
  const act = useGame((s) => s.act);
  const event = EVENTS_LOCAL(g.eventId);
  if (!event) return null;
  return (
    <Modal title="Uma decisão de governo" onClose={onClose} wide>
      <div className="decision-modal-content">
        <span className="eyebrow gold-text">
          {event.category} / {dateLabel(g.turn)}
        </span>
        <h3>{event.title}</h3>
        <p>{event.text}</p>
        <div className="choice-list">
          {event.choices.map((c, i) => (
            <button
              key={c.label}
              className="choice event-choice"
              disabled={g.finished || g.capital + (c.effects.capital ?? 0) < 0}
              onClick={() => {
                act({ type: 'decide', choice: i });
                onClose();
              }}
            >
              <span className="choice-number">0{i + 1}</span>
              <span>
                <strong>{c.label}</strong>
                <small>{c.detail}</small>
                {c.delayed && <em>Efeitos adicionais após {c.delay} meses.</em>}
              </span>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
        <p className="help">
          <CircleHelp size={13} /> Esta decisão precisa ser resolvida antes do próximo turno.
          Consequências ficam registradas no histórico.
        </p>
      </div>
    </Modal>
  );
}
import { EVENTS } from '../engine/events';
const EVENTS_LOCAL = (id: string | null) => EVENTS.find((e) => e.id === id);
