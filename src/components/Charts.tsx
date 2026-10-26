import { lazy, Suspense } from 'react';
import { PARTIES } from '../engine/data';
import { partySupport } from '../engine/legislature';
import type { Game } from '../engine/types';
const LazyTrendChart = lazy(() =>
  import('./TrendChart').then((module) => ({ default: module.TrendChart })),
);
export function TrendChart(props: {
  game: Game;
  metric?: 'approval' | 'growth' | 'inflation' | 'debt';
  compare?: boolean;
}) {
  return (
    <Suspense
      fallback={<div className="trend-chart chart-loading">Carregando a série histórica…</div>}
    >
      <LazyTrendChart {...props} />
    </Suspense>
  );
}
export function Hemicycle({ game, senate = false }: { game: Game; senate?: boolean }) {
  const dots: { x: number; y: number; color: string; yes: boolean; party: string }[] = [];
  const total = senate ? 81 : 513;
  let seat = 0;
  const rows = senate ? [17, 19, 21, 24] : [45, 51, 57, 63, 69, 75, 81, 72];
  for (let row = 0; row < rows.length; row++) {
    const count = rows[row];
    for (let j = 0; j < count; j++) {
      const index = Math.min(total - 1, seat++);
      let acc = 0;
      const party =
        PARTIES.find((p) => {
          acc += senate ? p.senate : p.seats;
          return index < acc;
        }) ?? PARTIES[0];
      const radius = 51 + row * 10;
      const angle = Math.PI - (j / (count - 1)) * Math.PI;
      dots.push({
        x: 150 + Math.cos(angle) * radius,
        y: 145 - Math.sin(angle) * radius,
        color: party.color,
        yes: game.coalition.includes(party.id),
        party: party.id,
      });
    }
  }
  return (
    <svg
      className="hemicycle"
      viewBox="8 12 284 145"
      role="img"
      aria-label={`${total} cadeiras ${senate ? 'do Senado' : 'da Câmara'}, coloridas por partido`}
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={senate ? 3.1 : 1.85}
          fill={d.color}
          opacity={d.yes ? 1 : 0.4}
        >
          <title>
            {d.party} ·{' '}
            {Math.round(
              partySupport(
                game,
                PARTIES.find((p) => p.id === d.party)!,
              ) * 100,
            )}
            % de apoio estimado
          </title>
        </circle>
      ))}
    </svg>
  );
}
