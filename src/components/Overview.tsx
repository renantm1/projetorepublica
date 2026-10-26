import {
  ArrowRight,
  ArrowUpRight,
  Circle,
  Clock3,
  FileText,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Panel, Delta, Bar, Architecture } from './ui';
import { TrendChart, Hemicycle } from './Charts';
import { BrazilMap } from './BrazilMap';
import { dateLabel, number, PARTIES } from '../engine/data';
import { EVENTS } from '../engine/events';
import { coalitionSeats, forecast } from '../engine/legislature';
import { useGame } from '../store';
import type { Game } from '../engine/types';
export function Overview({
  game: g,
  onDecision,
  onState,
}: {
  game: Game;
  onDecision: () => void;
  onState: (uf: string) => void;
}) {
  const nav = useGame((s) => s.setScreen);
  const last = g.series[Math.max(0, g.series.length - 2)];
  const event = EVENTS.find((e) => e.id === g.eventId);
  const seats = coalitionSeats(g);
  const stats = [
    {
      label: 'APROVAÇÃO',
      value: number(g.metrics.approval),
      unit: '%',
      delta: g.metrics.approval - last.approval,
      inverse: false,
      note: 'avaliação positiva',
    },
    {
      label: 'CRESCIMENTO DO PIB',
      value: number(g.metrics.growth),
      unit: '%',
      delta: g.metrics.growth - last.growth,
      inverse: false,
      note: 'variação anual estimada',
    },
    {
      label: 'INFLAÇÃO',
      value: number(g.metrics.inflation),
      unit: '%',
      delta: g.metrics.inflation - last.inflation,
      inverse: true,
      note: 'acumulado em 12 meses',
    },
    {
      label: 'DÍVIDA PÚBLICA',
      value: number(g.metrics.debt),
      unit: '%',
      delta: g.metrics.debt - last.debt,
      inverse: true,
      note: 'proporção do PIB',
    },
  ];
  return (
    <>
      <div className="briefing-banner">
        <span className="live-dot" />
        <strong>Boletim do gabinete</strong>
        <span>
          {g.turn === 0
            ? 'A posse terminou. O trabalho começa agora.'
            : g.metrics.approval >= 50
              ? 'O governo mantém avaliação positiva. Cada escolha conta.'
              : 'O governo enfrenta desgaste. É hora de rever prioridades.'}
        </span>
        <span className="banner-right">
          {g.turn === 0 ? 'PRIMEIRO MÊS DE GOVERNO' : `MÊS ${g.turn + 1} DO MANDATO`}
        </span>
      </div>
      <div className="kpi-grid">
        {stats.map((s) => (
          <div className="kpi" key={s.label}>
            <span className="eyebrow">{s.label}</span>
            <div className="kpi-value">
              {s.value}
              <small>{s.unit}</small>
              <Sparkline
                values={g.series
                  .slice(-9)
                  .map(
                    (p) =>
                      p[
                        s.label === 'APROVAÇÃO'
                          ? 'approval'
                          : s.label === 'INFLAÇÃO'
                            ? 'inflation'
                            : s.label === 'DÍVIDA PÚBLICA'
                              ? 'debt'
                              : 'growth'
                      ],
                  )}
              />
            </div>
            <div className="kpi-foot">
              <Delta value={s.delta} inverse={s.inverse} />
              <span>{s.note}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="overview-upper">
        <Panel
          title="O pulso da economia"
          eyebrow="CONJUNTURA NACIONAL"
          action={
            <button className="text-button" onClick={() => nav('economy')}>
              Análise completa <ArrowUpRight size={14} />
            </button>
          }
        >
          <div className="chart-summary">
            <div>
              <strong>
                {number(g.metrics.gdp, 2)} <small>tri</small>
              </strong>
              <span>PIB nominal · R$</span>
            </div>
            <div className="chart-legend">
              <span>
                <i className="gold-dot" />
                Crescimento
              </span>
              <span>
                <i className="blue-dot" />
                Inflação
              </span>
            </div>
          </div>
          <TrendChart game={g} />
          <div className="panel-foot">
            <Info size={12} />
            <span>
              {g.turn === 0
                ? 'Série histórica começa na posse. Avance o mês para acompanhar a evolução.'
                : 'Variações anuais estimadas. O Banco Central ajusta os juros de forma autônoma.'}
            </span>
          </div>
        </Panel>
        <section className="decision-panel">
          <div className="decision-top">
            <span className="eyebrow">MESA DO PRESIDENTE</span>
            <span className="tag">{event ? '1 DECISÃO' : 'AGENDA LIVRE'}</span>
          </div>
          <div className="decision-icon">
            <FileText size={22} strokeWidth={1.2} />
          </div>
          <span className="eyebrow gold-text">{event?.category ?? 'Planejamento de governo'}</span>
          <h2>{event?.title ?? 'O próximo passo é seu.'}</h2>
          <p>
            {event
              ? event.text.slice(0, 128) + '…'
              : 'Proponha uma política pública, dialogue com a base ou prepare a campanha. O tempo político é um recurso limitado.'}
          </p>
          <button className="button primary" onClick={event ? onDecision : () => nav('policies')}>
            {event ? 'Examinar decisão' : 'Definir prioridades'}
            <ArrowRight size={16} />
          </button>
          <Architecture className="decision-architecture" />
        </section>
      </div>
      <div className="overview-lower">
        <Panel
          title="A temperatura do país"
          eyebrow="TERRITÓRIO & OPINIÃO"
          action={
            <button
              className="icon-button"
              aria-label="Explorar mapa do Brasil"
              onClick={() => nav('map')}
            >
              <ArrowUpRight size={17} />
            </button>
          }
        >
          <div className="map-panel-inner">
            <BrazilMap game={g} compact onSelect={onState} />
            <div className="map-summary">
              <span className="eyebrow">BRASIL</span>
              <strong>
                {number(g.metrics.approval)}
                <small>%</small>
              </strong>
              <span className="muted">de aprovação</span>
              <div className="map-scale">
                <i />
                <i />
                <i />
                <i />
              </div>
              <span className="tiny muted">Menor → maior apoio</span>
              <button className="text-button" onClick={() => nav('map')}>
                Explorar estados <ChevronRight size={12} />
              </button>
            </div>
          </div>
          <div className="panel-foot">27 unidades federativas · indicadores simulados</div>
        </Panel>
        <Panel
          title="Governabilidade"
          eyebrow="CONGRESSO NACIONAL"
          action={
            <button
              className="icon-button"
              aria-label="Abrir Congresso"
              onClick={() => nav('congress')}
            >
              <ArrowUpRight size={17} />
            </button>
          }
        >
          <Hemicycle game={g} />
          <div className="congress-summary">
            <div>
              <strong>
                {seats}
                <small> / 513</small>
              </strong>
              <span>Cadeiras na coalizão</span>
            </div>
            <span className={`tag ${forecast(g) >= 257 ? 'positive' : ''}`}>
              {forecast(g) >= 257 ? 'BASE VIÁVEL' : 'BASE EM CONSTRUÇÃO'}
            </span>
          </div>
          <Bar value={(seats / 513) * 100} label="Cadeiras da coalizão" />
          <div className="congress-legend">
            <span>
              <Circle size={7} fill="#c5a46d" /> {g.coalition.length} partidos na base
            </span>
            <span>Maioria: 257</span>
          </div>
          <div className="panel-foot">
            <span>{PARTIES.length} bancadas · apoio varia conforme o projeto</span>
          </div>
        </Panel>
        <Panel
          title="Jornal da República"
          eyebrow="ÚLTIMAS EDIÇÕES"
          action={
            <button
              className="icon-button"
              aria-label="Ler todas as notícias"
              onClick={() => nav('news')}
            >
              <ArrowUpRight size={17} />
            </button>
          }
        >
          <div className="news-list">
            {g.history.slice(0, 3).map((h, i) => (
              <button className="news-item" key={h.id} onClick={() => nav('news')}>
                <span className="news-date">
                  <span className={i === 0 ? 'gold-text' : ''}>
                    {h.type === 'congress'
                      ? 'POLÍTICA'
                      : h.type === 'economy'
                        ? 'ECONOMIA'
                        : h.type === 'election'
                          ? 'ELEIÇÕES'
                          : 'GOVERNO'}
                  </span>
                  <span>{dateLabel(h.turn, true)}</span>
                </span>
                <h3>{h.title}</h3>
                <span className="news-preview">
                  {h.detail.replace(/\[.*?\]\s*/g, '').slice(0, 95)}…
                </span>
              </button>
            ))}
          </div>
          <button className="read-paper" onClick={() => nav('news')}>
            Abrir o jornal <ArrowRight size={13} />
          </button>
        </Panel>
      </div>
      <div className="calendar-strip">
        <Clock3 size={14} />
        <strong>No horizonte</strong>
        <span>Outubro 2030</span>
        <span>Eleições presidenciais</span>
        <div className="calendar-progress">
          <span style={{ width: `${Math.min(100, (g.turn / 45) * 100)}%` }} />
        </div>
        <span>{Math.max(0, 45 - g.turn)} meses até o pleito</span>
        <button className="text-button" onClick={() => nav('elections')}>
          Ver campanha <ArrowRight size={13} />
        </button>
      </div>
    </>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values),
    max = Math.max(...values);
  const range = Math.max(0.2, max - min);
  const points =
    values.length === 1
      ? '0,14 72,14'
      : values
          .map((v, i) => `${(i * 72) / (values.length - 1)},${24 - ((v - min) / range) * 20}`)
          .join(' ');
  return (
    <svg viewBox="0 0 75 28" className="spark" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
