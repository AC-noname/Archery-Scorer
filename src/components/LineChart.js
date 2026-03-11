import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, {
  Path, Circle, Line, Text as SvgText,
  Defs, LinearGradient, Stop,
} from "react-native-svg";
import { COLORS } from "../constants";
import { Card } from "./UI";

const WINDOW = 10;
const W      = 300;
const H      = 130;
const pad    = { t: 24, r: 13, b: 32, l: 40 };
const iW     = W - pad.l - pad.r;
const iH     = H - pad.t - pad.b;

function shortDate(dateStr) {
  if (!dateStr) return "";
  const p = dateStr.split(" ");
  return `${p[0]} ${p[1]}`;
}

export default function LineChart({ entries, pb }) {
  const [page, setPage] = useState(0);

  if (!entries || entries.length < 2) return null;

  const total     = entries.length;
  const maxPage   = Math.max(0, Math.ceil((total - WINDOW) / 5));
  const start     = Math.min(page * 5, Math.max(0, total - WINDOW));
  const visible   = entries.slice(start, start + WINDOW);
  const visCount  = visible.length;

  const max   = Math.max(...visible.map(e => e.total));
  const min   = Math.max(Math.min(...visible.map(e => e.total)) - 5, 0);
  const range = max - min || 1;

  // 4 y-axis ticks
  const yTicks = [0, 1, 2, 3].map(i => Math.round(min + (i / 2) * range));

  const pts = visible.map((e, i) => ({
    x:     pad.l + (visCount === 1 ? iW / 2 : (i / (visCount - 1)) * iW),
    y:     pad.t + iH - ((e.total - min) / range) * iH,
    total: e.total,
    date:  e.date,
    isPB:  e.total === pb,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length-1].x},${pad.t+iH} L${pts[0].x},${pad.t+iH}Z`;

  // 5 evenly spaced x-axis labels
  const xIndices = visCount <= 5
    ? visible.map((_, i) => i)
    : [0, 1, 2, 3, 4].map(i => Math.round(i / 3 * (visCount - 1)));

  const canPrev = page > 0;
  const canNext = page < maxPage;

  return (
    <Card style={styles.card}>
      <Svg width={W} height={H} style={{ overflow: "visible" }}>
        <Defs>
          <LinearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.12" />
            <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {yTicks.map((t, i) => {
          const y = pad.t + iH - ((t - min) / range) * iH;
          return (
            <React.Fragment key={i}>
              <Line x1={pad.l} y1={y} x2={pad.l + iW} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <SvgText x={pad.l - 20} y={y + 3} fontSize="8" fill="#c0c0c0" textAnchor="end">{t}</SvgText>
            </React.Fragment>
          );
        })}

        <Path d={areaPath} fill="url(#lg)" />
        <Path d={linePath} fill="none" stroke={COLORS.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p, i) => (
          <React.Fragment key={i}>
            <Circle
              cx={p.x} cy={p.y}
              r={p.isPB ? 5 : 3.5}
              fill={p.isPB ? COLORS.accent : "#fff"}
              stroke={COLORS.accent}
              strokeWidth="2"
            />
            <SvgText x={p.x} y={p.y - 9} fontSize="9" fill={COLORS.accent} textAnchor="middle" fontWeight="700">
              {p.total}
            </SvgText>
          </React.Fragment>
        ))}

        {xIndices.map((idx, i) => (
          <SvgText key={i} x={pts[idx]?.x} y={H - 2} fontSize="8" fill="#bbb" textAnchor="middle">
            {shortDate(visible[idx]?.date)}
          </SvgText>
        ))}
      </Svg>

      {total > WINDOW && (
        <View style={styles.nav}>
          <TouchableOpacity
            onPress={() => setPage(p => Math.max(0, p - 1))}
            style={[styles.navBtn, !canPrev && styles.navBtnDisabled]}
            disabled={!canPrev}
          >
            <Text style={[styles.navText, !canPrev && styles.navTextDisabled]}>‹ Prev</Text>
          </TouchableOpacity>

          <Text style={styles.navMeta}>
            {start + 1}–{start + visCount} of {total}
          </Text>

          <TouchableOpacity
            onPress={() => setPage(p => Math.min(maxPage, p + 1))}
            style={[styles.navBtn, !canNext && styles.navBtnDisabled]}
            disabled={!canNext}
          >
            <Text style={[styles.navText, !canNext && styles.navTextDisabled]}>Next ›</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card:           { padding: 12, alignItems: "center" },
  nav:            { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: W, marginTop: 8 },
  navBtn:         { paddingVertical: 4, paddingHorizontal: 10, backgroundColor: COLORS.accentBg, borderRadius: 8 },
  navBtnDisabled: { backgroundColor: "#f5f5f5" },
  navText:        { fontSize: 12, fontWeight: "600", color: COLORS.accent },
  navTextDisabled:{ color: "#ccc" },
  navMeta:        { fontSize: 11, color: COLORS.muted },
});