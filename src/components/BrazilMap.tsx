import { useEffect, useState } from 'react';
import { REGIONS } from '../engine/data';
import { regionalApproval } from '../engine/election';
import type { Game } from '../engine/types';
interface MapData {
  viewBox: string;
  locations: { id: string; name: string; path: string; label: [number, number] }[];
}
let cached: MapData | null = null;
export function BrazilMap({
  game,
  selected,
  onSelect,
  compact = false,
}: {
  game: Game;
  selected?: string;
  onSelect: (uf: string) => void;
  compact?: boolean;
}) {
  const [data, setData] = useState<MapData | null>(cached);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (cached) return;
    const controller = new AbortController();
    fetch('data/brazil-states.json', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((result) => {
        cached = result;
        setData(cached);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(true);
      });
    return () => controller.abort();
  }, []);
  const [hover, setHover] = useState<string | null>(null);
  if (error)
    return (
      <p className="muted map-error">
        O mapa não pôde ser carregado. Consulte a tabela de estados.
      </p>
    );
  const value = (uf: string) =>
    game.elections.resultsByState[uf] ??
    regionalApproval(
      game,
      REGIONS.find((r) => r.uf === uf)!,
    );
  const color = (uf: string) => {
    const n = value(uf);
    return n >= 60
      ? '#658e87'
      : n >= 50
        ? '#476b69'
        : n >= 40
          ? '#847e61'
          : n >= 30
            ? '#805b57'
            : '#66444a';
  };
  return (
    <div className={`brazil-map ${compact ? 'compact' : ''}`}>
      <svg
        viewBox={data?.viewBox ?? '0 0 613 639'}
        role="group"
        aria-label="Mapa interativo das 27 unidades federativas do Brasil"
      >
        {data?.locations.map((loc) => (
          <path
            key={loc.id}
            d={loc.path}
            fill={color(loc.id)}
            stroke={selected === loc.id || hover === loc.id ? '#e8c994' : '#101923'}
            strokeWidth={selected === loc.id || hover === loc.id ? 2.4 : 1.3}
            tabIndex={0}
            role="button"
            aria-label={`${REGIONS.find((r) => r.uf === loc.id)?.name ?? loc.name}: ${Math.round(value(loc.id))}% ${game.elections.firstRound.length ? 'dos votos' : 'de aprovação'}`}
            aria-pressed={selected === loc.id}
            onClick={() => onSelect(loc.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(loc.id);
              }
            }}
            onMouseEnter={() => setHover(loc.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(loc.id)}
            onBlur={() => setHover(null)}
          >
            <title>{loc.name}</title>
          </path>
        ))}
        {data?.locations
          .filter((loc) => loc.id !== 'DF' || !compact)
          .map((loc) => (
            <text
              key={loc.id}
              x={loc.label[0]}
              y={loc.label[1]}
              textAnchor="middle"
              dy=".35em"
              className="map-label"
            >
              {loc.id}
            </text>
          ))}
      </svg>
      {!data && <span className="map-loading">Carregando território…</span>}
    </div>
  );
}
