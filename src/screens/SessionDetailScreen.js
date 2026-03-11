import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { COLORS, ARROWS_PER_END } from "../constants";
import { sv } from "../utils/helpers";
import { Sec, TabToggle, Card } from "../components/UI";
import ScoreSheet from "../components/ScoreSheet";
import DistributionChart from "../components/DistributionChart";
import TargetFace from "../components/TargetFace";

export default function SessionDetailScreen({ session, onBack }) {
  const s = session;
  const [tab, setTab]     = useState("score");
  const [viewEnd, setViewEnd] = useState("all");

  const isW     = s.endsCount === 12;
  const allArr  = s.ends?.flat() || [];
  const r1Arr   = isW ? s.ends?.slice(0, 6).flat() || [] : [];
  const r2Arr   = isW ? s.ends?.slice(6).flat()    || [] : [];
  const r1Total = r1Arr.reduce((a, v) => a + sv(v), 0);
  const r2Total = r2Arr.reduce((a, v) => a + sv(v), 0);
  const total   = allArr.reduce((a, v) => a + sv(v), 0);
  const hasSpan = s.spanData?.some(e => e.length > 0);
  const numEnds = s.ends?.length || 0;

  const selectedArrows = viewEnd === "all"
    ? (s.spanData?.flat() || [])
    : (s.spanData?.[viewEnd] || []);

  const selectedScores = viewEnd === "all"
    ? allArr
    : (s.ends?.[viewEnd] || []);

  const r1count  = s.spanData?.slice(0, 6).flat().length || 0;
  const showR2   = isW && viewEnd === "all";
  const spTotal  = selectedScores.reduce((a, v) => a + sv(v), 0);
  const spAvg    = selectedScores.length ? (spTotal / selectedScores.length).toFixed(1) : "–";
  const spBest   = selectedScores.length ? Math.max(...selectedScores.map(sv)) : "–";

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{s.distance} · {s.endsCount} ends</Text>
          <Text style={styles.meta}>{s.date} · {s.time}{s.location ? `  📍 ${s.location}` : ""}</Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      {/* Score hero */}
      <View style={styles.hero}>
        <Text style={styles.score}>{total}</Text>
        {isW && <Text style={styles.rounds}>{r1Total} + {r2Total}</Text>}
        <Text style={styles.outOf}>out of {s.endsCount * 60} · {Math.round(total / (s.endsCount * 60) * 100)}%</Text>
      </View>

      {/* Tab toggle */}
      {hasSpan && (
        <TabToggle
          value={tab}
          onChange={setTab}
          options={[{ value: "score", label: "Score card" }, { value: "span", label: "🎯 Arrow span" }]}
        />
      )}

      {/* Score card tab */}
      {tab === "score" && (
        <>
          <Sec label="Score sheet">
            <ScoreSheet ends={s.ends} isW={isW} />
          </Sec>
          <Sec label="Arrow distribution">
            <DistributionChart arrows={allArr} />
          </Sec>
        </>
      )}

      {/* Span tab — inline, no navigation */}
      {tab === "span" && hasSpan && (
        <Sec>
          {/* End selector pills */}
          <View style={styles.endPills}>
            <EndPill label="All" active={viewEnd === "all"} onPress={() => setViewEnd("all")} tall isW={isW} />
            <View style={styles.endPillsRight}>
              {Array.from({ length: numEnds }).map((_, i) => {
                const has    = (s.spanData?.[i] || []).length > 0;
                const active = viewEnd === i;
                const label  = isW ? `R${Math.floor(i / 6) + 1}·${(i % 6) + 1}` : `E${i + 1}`;
                return (
                  <EndPill key={i} label={label} active={active} disabled={!has} onPress={() => has && setViewEnd(i)} />
                );
              })}
            </View>
          </View>

          {/* Target */}
          <View style={styles.targetWrap}>
            <TargetFace
              arrows={selectedArrows}
              size={300}
              r1Count={r1count}
              showRoundColors={showR2}
            />
          </View>

          {/* R1/R2 legend */}
          {showR2 && (
            <View style={styles.legend}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#1a1a1a" }]} /><Text style={styles.legendText}>Round 1</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} /><Text style={styles.legendText}>Round 2</Text></View>
            </View>
          )}

          {/* Score chips for single end */}
          {viewEnd !== "all" && selectedScores.length > 0 && (
            <View style={styles.chips}>
              {selectedScores.map((a, i) => {
                const { ZONE } = require("../constants");
                const z = ZONE[a];
                return (
                  <View key={i} style={[styles.chip, { backgroundColor: z.bg }, (a === 1 || a === 2) && styles.chipBordered]}>
                    <Text style={[styles.chipText, { color: z.text }]}>{String(a)}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Stats */}
          <Card style={styles.statsCard}>
            {[
              { label: "Score",     val: spTotal },
              { label: "Avg/arrow", val: spAvg   },
              { label: "Best",      val: spBest  },
              { label: "Arrows",    val: selectedScores.length },
            ].map((item, i) => (
              <View key={i} style={[styles.statItem, i < 3 && styles.statBorder]}>
                <Text style={styles.statVal}>{item.val}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </Card>
        </Sec>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function EndPill({ label, active, disabled, onPress, tall, isW }) {
  const { COLORS } = require("../constants");
  const PILL_W = Math.floor((require("react-native").Dimensions.get("window").width - 36) / 7) - 4;
  const PILL_H = 36;
  const PILL_GAP = 4;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.pill,
        { width: PILL_W, height: PILL_H },
        tall && { width: PILL_W, height: isW ? PILL_H * 2 + PILL_GAP : PILL_H, justifyContent: "center" },
        active ? styles.pillActive : disabled ? styles.pillDisabled : styles.pillIdle,
      ]}
    >
      <Text style={[styles.pillText, active ? styles.pillTextActive : disabled ? styles.pillTextDisabled : styles.pillTextIdle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll:   { flex: 1, backgroundColor: COLORS.bg },
  content:  { paddingBottom: 60 },
  header:   { paddingTop: 56, paddingHorizontal: 18, paddingBottom: 4, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  back:     { fontSize: 14, color: COLORS.muted, paddingTop: 2 },
  titleBlock: { alignItems: "center" },
  title:    { fontSize: 15, fontWeight: "700", color: COLORS.text },
  meta:     { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  hero:     { alignItems: "center", paddingVertical: 20 },
  score:    { fontSize: 60, fontWeight: "900", color: COLORS.text, letterSpacing: -3, lineHeight: 64 },
  rounds:   { fontSize: 13, color: COLORS.accent, fontWeight: "600", marginTop: 4 },
  outOf:    { fontSize: 13, color: COLORS.muted, marginTop: 4 },

  endPills:      { flexDirection: "row", gap: 4, marginBottom: 14 },
  endPillsRight: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  pill:          { borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pillActive:    { backgroundColor: COLORS.accent, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 5, elevation: 3 },
  pillIdle:      { backgroundColor: "#fff", borderWidth: 1.5, borderColor: COLORS.border },
  pillDisabled:  { backgroundColor: "#f7f7f7", borderWidth: 1.5, borderColor: "#f0f0f0" },
  pillText:          { fontSize: 11, fontWeight: "700" },
  pillTextActive:    { color: "#fff" },
  pillTextIdle:      { color: COLORS.text },
  pillTextDisabled:  { color: "#ccc" },

  targetWrap: { alignItems: "center", marginVertical: 14 },
  legend:     { flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot:  { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: COLORS.sub },
  chips:      { flexDirection: "row", gap: 5, marginBottom: 12 },
  chip:       { flex: 1, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chipBordered: { borderWidth: 1, borderColor: "#ddd" },
  chipText:   { fontSize: 14, fontWeight: "800" },
  statsCard:  { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 16, marginTop: 8 },
  statItem:   { flex: 1, alignItems: "center" },
  statBorder: { borderRightWidth: 1, borderRightColor: "#f2f2f2" },
  statVal:    { fontSize: 20, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  statLabel:  { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});