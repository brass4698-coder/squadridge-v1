import React from 'react';

// ViewBox 229 × 243. Inner grid: 6 × 6.
// Narrative: reddish-brown = bombs (off the safe path). Navy polygon = bridge.
// Dots = people on the bridge only — drawn last. Mines never overlap the bridge.
// Mine fill is slightly brighter than #2A1A1C so it reads on #121822 / #181F2A.

const COLORS = {
  appBg: '#222935',
  cellDark: '#121822',
  cellMid: '#181F2A',
  /** Mines — same family as #2A1A1C, lifted slightly so they read on dark cells */
  cellRed: '#4a2824',
  cellRedStroke: '#6b3d36',
  band: '#0B2848',
  dot: '#E4E6EA',
} as const;

const GRID_LEFT = 19;
const GRID_RIGHT = 209;
const GRID_TOP = 27;
const GRID_BOTTOM = 212;
const GAP = 3;
const COLS = 6;
const ROWS = 6;

function buildAxisRanges(start: number, end: number, count: number, gap: number): [number, number][] {
  const span = end - start + 1;
  const inner = span - gap * (count - 1);
  const base = Math.floor(inner / count);
  let extra = inner - base * count;
  const ranges: [number, number][] = [];
  let pos = start;
  for (let i = 0; i < count; i++) {
    const w = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra -= 1;
    const x1 = pos;
    const x2 = pos + w - 1;
    ranges.push([x1, x2]);
    pos = x2 + 1 + gap;
  }
  return ranges;
}

const COL_RANGES = buildAxisRanges(GRID_LEFT, GRID_RIGHT, COLS, GAP);
const ROW_RANGES = buildAxisRanges(GRID_TOP, GRID_BOTTOM, ROWS, GAP);

const BAND_POINTS = '178,27 208,27 208,59 50,211 19,211 19,182';

function parseBandPoints(s: string): [number, number][] {
  return s
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [a, b] = pair.split(',').map(Number);
      return [a, b] as [number, number];
    });
}

const BAND_VERTS = parseBandPoints(BAND_POINTS);

/** Ray-cast: true if point lies inside the bridge polygon (cell is part of the bridge path). */
function pointInPolygon(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const denom = yj - yi;
    if (denom === 0) continue;
    const xCross = ((xj - xi) * (y - yi)) / denom + xi;
    if ((yi > y) !== (yj > y) && x < xCross) inside = !inside;
  }
  return inside;
}

function cellCenter(r: number, c: number): [number, number] {
  const [x1, x2] = COL_RANGES[c];
  const [y1, y2] = ROW_RANGES[r];
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}

/** True if this grid cell’s centre lies on the bridge (navy band) — no mines here. */
function cellIsOnBridge(r: number, c: number): boolean {
  const [x, y] = cellCenter(r, c);
  return pointInPolygon(x, y, BAND_VERTS);
}

type CellKey = 'D' | 'M';

const CELL_FILL: Record<CellKey, string> = {
  D: COLORS.cellDark,
  M: COLORS.cellMid,
};

/**
 * Intended mine positions [row,col]. Skipped if the cell centre lies inside the bridge polygon.
 * (Corners like 0,5 / 5,0 sit on the band in this asset — excluded automatically.)
 */
const MINE_RC_REQUESTED = new Set<string>([
  '0,0',
  '0,1',
  '0,4',
  '1,0',
  '2,0',
  '2,5',
  '3,0',
  '3,5',
  '4,0',
  '5,5',
]);

function mineKeysToRender(): string[] {
  const fromRequest = Array.from(MINE_RC_REQUESTED).filter((key) => {
    const [r, c] = key.split(',').map(Number);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    return !cellIsOnBridge(r, c);
  });
  if (fromRequest.length > 0) return fromRequest;

  const fallback: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!cellIsOnBridge(r, c)) fallback.push(`${r},${c}`);
    }
  }
  return fallback.slice(0, 4);
}

const GRID: CellKey[][] = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: COLS }, (_, c) => ((r + c) % 2 === 0 ? 'D' : 'M')),
);

const DOTS: [number, number][] = [
  [54, 175],
  [76, 153],
  [98, 132],
  [121, 111],
  [143, 89],
  [165, 67],
];

const DOT_RADIUS = 6.2;

export interface LogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ size = 229, className, style }) => {
  const VIEW_W = 229;
  const VIEW_H = 243;
  const CORNER_RADIUS = 38;

  const mines = mineKeysToRender();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={size}
      height={Math.round(size * (VIEW_H / VIEW_W))}
      className={className}
      style={style}
      role="img"
      aria-label="SquadRidge logo"
    >
      <rect
        x={0}
        y={0}
        width={VIEW_W}
        height={VIEW_H}
        rx={CORNER_RADIUS}
        ry={CORNER_RADIUS}
        fill={COLORS.appBg}
      />

      {GRID.flatMap((row, rowIdx) => {
        const [y1, y2] = ROW_RANGES[rowIdx];
        return row.map((cellKey, colIdx) => {
          const [x1, x2] = COL_RANGES[colIdx];
          return (
            <rect
              key={`cell-${rowIdx}-${colIdx}`}
              x={x1}
              y={y1}
              width={x2 - x1 + 1}
              height={y2 - y1 + 1}
              fill={CELL_FILL[cellKey]}
              rx={1.25}
            />
          );
        });
      })}

      {/* Mines only off the bridge; drawn before the band so they sit in the minefield */}
      {mines.map((key) => {
        const [rs, cs] = key.split(',');
        const r = Number(rs);
        const c = Number(cs);
        const [y1, y2] = ROW_RANGES[r];
        const [x1, x2] = COL_RANGES[c];
        return (
          <rect
            key={`mine-${key}`}
            x={x1}
            y={y1}
            width={x2 - x1 + 1}
            height={y2 - y1 + 1}
            fill={COLORS.cellRed}
            stroke={COLORS.cellRedStroke}
            strokeWidth={1}
            rx={1.25}
          />
        );
      })}

      <polygon points={BAND_POINTS} fill={COLORS.band} />

      {DOTS.map(([cx, cy], i) => (
        <circle key={`dot-${i}`} cx={cx} cy={cy} r={DOT_RADIUS} fill={COLORS.dot} />
      ))}
    </svg>
  );
};

export default Logo;
