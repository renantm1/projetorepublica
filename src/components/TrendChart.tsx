import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { dateLabel, number } from '../engine/data';
import type { Game } from '../engine/types';
export function TrendChart({
  game,
  metric = 'growth',
  compare = true,
}: {
  game: Game;
  metric?: 'approval' | 'growth' | 'inflation' | 'debt';
  compare?: boolean;
}) {
  const data = game.series.map((p) => ({ ...p, date: dateLabel(p.turn, true) }));
  const labels = {
    approval: 'Aprovação',
    growth: 'Crescimento',
    inflation: 'Inflação',
    debt: 'Dívida / PIB',
  };
  return (
    <div
      className="trend-chart"
      aria-label={`Evolução de ${labels[metric]}: ${number(game.series[0][metric])}% no início, ${number(game.metrics[metric])}% atualmente`}
    >
      <ResponsiveContainer width="100%" height="100%">
        {compare && metric === 'growth' ? (
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="#ffffff0a" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#7c8994', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={48}
            />
            <YAxis
              tick={{ fill: '#7c8994', fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#1a2632', border: '1px solid #38434b', fontSize: 12 }}
              formatter={(v, name) => [
                `${number(Number(v), 2)}%`,
                name === 'growth' ? 'Crescimento' : 'Inflação',
              ]}
            />
            <Line
              type="monotone"
              dataKey="inflation"
              stroke="#788f9d"
              strokeDasharray="4 4"
              strokeWidth={1.7}
              dot={data.length === 1}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#c5a46d"
              strokeWidth={2.2}
              dot={data.length === 1}
              isAnimationActive={false}
            />
          </LineChart>
        ) : (
          <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="area-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c5a46d" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#c5a46d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#ffffff0a" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#7c8994', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={48}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#7c8994', fontSize: 10 }}
              tickFormatter={(v) => `${number(v, 0)}%`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#1a2632', border: '1px solid #38434b', fontSize: 12 }}
              formatter={(v) => [`${number(Number(v), 2)}%`, labels[metric]]}
            />
            <Area
              dataKey={metric}
              type="monotone"
              stroke="#c5a46d"
              fill="url(#area-gold)"
              strokeWidth={2}
              dot={data.length === 1}
              isAnimationActive={false}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
