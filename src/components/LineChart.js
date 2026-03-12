import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import Svg, {
  Path, Circle, Line, Text as SvgText,
  Defs, LinearGradient, Stop,
} from "react-native-svg";
import { COLORS } from "../constants";
import { Card } from "./UI";

const SCREEN_W  = Dimensions.get("window").width - 72;
const H         = 150;
const PT_SPACING = 52; // px between each data point
const pad       = { t: 24, r: 32, b: 24, l: 32 };
const iH        = H - pad.t - pad.b;

function shortDate(dateStr) {
  if (!dateStr) return "";
  const p = dateStr.split(" ");
  return `${p[0]} ${p[1]}`;
}

export default function LineChart({ entries, pb }) {
  if (!entries || entries.length < 2) return null;

  const total = entries.length;

  // Chart is wide enough to space all points nicely
  const W   = Math.max(SCREEN_W, pad.l + (total - 1) * PT_SPACING + pad.r);
  const iW  = W - pad.l - pad.r;

  const max   = Math.max(...entries.map(e => e.total));
  const min   = Math.max(Math.min(...entries.map(e => e.total)) - 5, 0);
  const range = max - min || 1;

  const yTicks = [0, 1, 2].map(i => Math.round(min + (i / 2) * range));

  const pts = entries.map((e, i) => ({
    x:     pad.l + (total === 1 ? iW / 2 : (i / (total - 1)) * iW),
    y:     pad.t + iH - ((e.total - min) / range) * iH,
    total: e.total,
    date:  e.date,
    isPB:  e.total === pb,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length-1].x},${pad.t+iH} L${pts[0].x},${pad.t+iH}Z`;

  return (
    <Card style={styles.card}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="normal"
        contentContainerStyle={{ width: W }}
        style={{ width: SCREEN_W }}
      >
        <Svg width={W} height={H} style={{ overflow: "visible" }}>
          <Defs>
            <LinearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.12" />
              <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Y axis ticks — fixed to left edge */}
          {yTicks.map((t, i) => {
            const y = pad.t + iH - ((t - min) / range) * iH;
            return (
              <React.Fragment key={i}>
                <Line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                <SvgText x={pad.l - 15} y={y + 3} fontSize="8" fill="#c0c0c0" textAnchor="end">{t}</SvgText>
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
              <SvgText x={p.x} y={H - 6} fontSize="8" fill="#bbb" textAnchor="middle">
                {shortDate(p.date)}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </ScrollView>

      {total > 6 && (
        <Text style={styles.hint}>← Scroll to explore →</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 17, alignItems: "center" },
  hint: { fontSize: 10, color: "#ccc", marginTop: 6 },
});