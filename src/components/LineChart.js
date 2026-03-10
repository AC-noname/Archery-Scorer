import React from "react";
import { View } from "react-native";
import Svg, {
  Path, Circle, Line, Text as SvgText,
  Defs, LinearGradient, Stop,
} from "react-native-svg";
import { COLORS } from "../constants";
import { Card } from "./UI";

export default function LineChart({ entries, pb }) {
  if (entries.length < 2) return null;

  const W = 300, H = 110;
  const pad = { t: 18, r: 12, b: 24, l: 36 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const max = Math.max(...entries.map(e => e.total));
  const min = Math.max(Math.min(...entries.map(e => e.total)) - 10, 0);
  const range = max - min || 1;

  const pts = entries.map((e, i) => ({
    x: pad.l + (i / (entries.length - 1)) * iW,
    y: pad.t + iH - ((e.total - min) / range) * iH,
    total: e.total,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${pad.t + iH} L${pts[0].x},${pad.t + iH}Z`;
  const ticks = [min, Math.round((min + max) / 2), max];

  return (
    <Card style={{ padding: 12 }}>
      <Svg width={W} height={H} style={{ overflow: "visible" }}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {ticks.map(t => {
          const y = pad.t + iH - ((t - min) / range) * iH;
          return (
            <React.Fragment key={t}>
              <Line x1={pad.l} y1={y} x2={pad.l + iW} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <SvgText x={pad.l - 4} y={y + 4} fontSize="9" fill="#ccc" textAnchor="end">{t}</SvgText>
            </React.Fragment>
          );
        })}

        <Path d={areaPath} fill="url(#grad)" />
        <Path d={linePath} fill="none" stroke={COLORS.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r={4} fill={p.total === pb ? COLORS.accent : "#fff"} stroke={COLORS.accent} strokeWidth="2" />
            <SvgText x={p.x} y={p.y - 9} fontSize="9" fill={COLORS.accent} textAnchor="middle" fontWeight="600">{p.total}</SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </Card>
  );
}
