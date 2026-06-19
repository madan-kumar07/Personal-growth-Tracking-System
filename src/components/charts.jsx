import React, { useMemo } from "react";
import { getLast7Days, getLast30Days, MONTHS_SHORT } from "../utils.js";

const TEXT     = "var(--text-2)";
const TEXT_DIM = "var(--text-3)";

// ─── Bar Chart ────────────────────────────────────────────────────────────────
export function BarChart({ data = [], color = "#6366f1", height = 140, showLabels = true }) {
  const max    = Math.max(...data.map(d => d.value), 1);
  const w      = 100 / data.length;
  const barW   = Math.max(4, w * 0.6);

  if (!data.some(d => d.value > 0)) {
    return (
      <div style={{ height, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
        <div style={{ fontSize:24, opacity:0.4 }}>📊</div>
        <div style={{ fontSize:11, color:"var(--text-3)" }}>No data yet</div>
        <div style={{ display:"flex", gap:4, alignItems:"flex-end", opacity:0.15, height:60, padding:"0 8px" }}>
          {data.map((_, i) => <div key={i} style={{ flex:1, background:color, borderRadius:"3px 3px 0 0", height: `${20 + (i%3)*15}%` }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ height }}>
      <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" className="chart-svg" style={{ height: showLabels ? "80%" : "100%" }}>
        {data.map((d, i) => {
          const barH   = (d.value / max) * 90;
          const x      = i * w + (w - barW) / 2;
          return (
            <g key={i}>
              <rect
                x={x} y={100 - barH} width={barW} height={barH}
                rx={2} fill={color} opacity={0.85}
                className="chart-bar"
              />
              {d.value > 0 && (
                <text x={x + barW/2} y={100 - barH - 3} textAnchor="middle" className="chart-value" fontSize={7}>
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {showLabels && (
        <div style={{ display:"flex", paddingTop:4 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex:1, textAlign:"center", fontSize:10, color:"var(--text-3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {d.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
export function LineChart({ data = [], color = "#6366f1", height = 120, showDots = true }) {
  const values = data.map(d => d.value);
  const max    = Math.max(...values, 1);
  const min    = 0;
  const range  = max - min || 1;
  const n      = data.length;

  if (!values.some(v => v > 0)) {
    return (
      <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6 }}>
        <div style={{ fontSize:24, opacity:0.3 }}>📈</div>
        <div style={{ fontSize:11, color:"var(--text-3)" }}>Start tracking to see trends</div>
      </div>
    );
  }

  const pts = values.map((v, i) => {
    const x = n > 1 ? (i / (n - 1)) * 100 : 50;
    const y = 100 - ((v - min) / range) * 80 - 5;
    return `${x},${y}`;
  }).join(" ");

  const areaPath = `M ${pts.split(" ").join(" L ")} L 100,100 L 0,100 Z`;

  return (
    <div className="chart-container" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-svg">
        <defs>
          <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${color.replace("#","")})`} />
        <polyline points={pts} className="chart-line" stroke={color} />
        {showDots && values.map((v, i) => {
          const x = n > 1 ? (i / (n - 1)) * 100 : 50;
          const y = 100 - ((v - min) / range) * 80 - 5;
          return <circle key={i} cx={x} cy={y} r={2} fill={color} className="chart-dot" />;
        })}
      </svg>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:10, color:"var(--text-3)" }}>
        {data.length <= 8 && data.map((d, i) => <span key={i}>{d.label}</span>)}
        {data.length > 8 && (
          <>
            <span>{data[0].label}</span>
            <span>{data[Math.floor(data.length/2)].label}</span>
            <span>{data[data.length-1].label}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
export function DonutChart({ data = [], size = 140, centerLabel, centerSub }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) {
    return (
      <div style={{ width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={size/2-10} fill="none" stroke="var(--surface-3)" strokeWidth={16} />
          <text x={size/2} y={size/2+4} textAnchor="middle" fill="var(--text-3)" fontSize={11}>No data</text>
        </svg>
      </div>
    );
  }

  const r    = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b","#f43f5e","#8b5cf6","#3b82f6","#22c55e"];

  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        {data.map((d, i) => {
          const pct  = d.value / total;
          const dash = pct * circ;
          const seg  = (
            <circle
              key={i}
              cx={size/2} cy={size/2} r={r}
              fill="none"
              stroke={d.color || COLORS[i % COLORS.length]}
              strokeWidth={18}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      {(centerLabel !== undefined) && (
        <div style={{ position:"absolute", textAlign:"center" }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:18, color:"var(--text)" }}>{centerLabel}</div>
          {centerSub && <div style={{ fontSize:11, color:"var(--text-3)" }}>{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────
export function RadarChart({ data = [], size = 180 }) {
  const n     = data.length;
  const cx    = size / 2;
  const cy    = size / 2;
  const r     = size / 2 - 28;
  const step  = (2 * Math.PI) / n;

  const point = (i, radius) => ({
    x: cx + radius * Math.sin(i * step - Math.PI / 2),
    y: cy - radius * Math.cos(i * step - Math.PI / 2),
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPolygons = gridLevels.map(lvl => {
    const pts = Array.from({ length: n }, (_, i) => {
      const p = point(i, r * lvl);
      return `${p.x},${p.y}`;
    }).join(" ");
    return <polygon key={lvl} points={pts} fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth={1} />;
  });

  const dataPolygon = data.map((d, i) => {
    const p = point(i, r * (Math.min(100, d.value) / 100));
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg width={size} height={size}>
      {gridPolygons}
      {Array.from({ length: n }, (_, i) => {
        const p = point(i, r);
        const lp = point(i, r + 20);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(99,102,241,0.15)" strokeWidth={1} />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="var(--text-3)">
              {data[i]?.label || ""}
            </text>
          </g>
        );
      })}
      <polygon points={dataPolygon} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth={2} />
      {data.map((d, i) => {
        const p = point(i, r * (Math.min(100, d.value) / 100));
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#6366f1" />;
      })}
    </svg>
  );
}

// ─── Weekly XP Chart (convenience) ────────────────────────────────────────────
export function WeeklyXPChart({ xpHistory = [] }) {
  const days = getLast7Days();
  const data = days.map(iso => {
    const dayTotal = xpHistory
      .filter(x => x.date === iso)
      .reduce((s, x) => s + (x.amount || 0), 0);
    const d = new Date(iso);
    return { label: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()], value: dayTotal };
  });
  return <BarChart data={data} color="#6366f1" height={140} />;
}

// ─── Legend ───────────────────────────────────────────────────────────────────
export function Legend({ items }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginTop:8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-2)" }}>
          <div style={{ width:10, height:10, borderRadius:2, background: item.color, flexShrink:0 }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
