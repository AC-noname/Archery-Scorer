import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { COLORS } from "../constants";
import { sv } from "../utils/helpers";
import { Card } from "../components/UI";
import TargetFace from "../components/TargetFace";
import { Dimensions } from "react-native";
const PILL_W = Math.floor((Dimensions.get("window").width - 36) / 7) - 5;
const PILL_H = 36;
const PILL_GAP = 4;

export default function SpanViewScreen({ session, onBack }) {
  const s = session;
  const [viewEnd, setViewEnd] = useState("all");

  const isW = s.endsCount === 12;
  const numEnds = s.ends?.length || 0;

  const selectedArrows = viewEnd === "all"
    ? (s.spanData?.flat() || [])
    : (s.spanData?.[viewEnd] || []);

  const selectedScores = viewEnd === "all"
    ? (s.ends?.flat() || [])
    : (s.ends?.[viewEnd] || []);

  const r1count = s.spanData?.slice(0, 6).flat().length || 0;
  const showR2 = isW && viewEnd === "all";

  const spTotal = selectedScores.reduce((a, v) => a + sv(v), 0);
  const spAvg = selectedScores.length ? (spTotal / selectedScores.length).toFixed(1) : "–";
  const spBest = selectedScores.length ? Math.max(...selectedScores.map(sv)) : "–";

  return (
    <View style={styles.screen}>
      {/* Back */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{s.distance} · Span</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.endPills}>
          <View style={styles.endPillsLeft}>
            <EndPill label="All" active={viewEnd === "all"} onPress={() => setViewEnd("all")} tall isW={isW} />
          </View>
          <View style={styles.endPillsRight}>
            {Array.from({ length: numEnds }).map((_, i) => {
              const has = (s.spanData?.[i] || []).length > 0;
              const active = viewEnd === i;
              const label = isW ? `R${Math.floor(i / 6) + 1}·${(i % 6) + 1}` : `E${i + 1}`;
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
            size={310}
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
            { label: "Score", val: spTotal },
            { label: "Avg/arrow", val: spAvg },
            { label: "Best", val: spBest },
            { label: "Arrows", val: selectedScores.length },
          ].map((item, i) => (
            <View key={i} style={[styles.statItem, i < 3 && styles.statBorder]}>
              <Text style={styles.statVal}>{item.val}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function EndPill({ label, active, disabled, onPress, tall, isW }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.pill,
        tall && { width: PILL_W, height: isW ? 72 : 34, justifyContent: "center" },
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
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { paddingTop: 56, paddingBottom: 12, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: {},
  backText: { fontSize: 14, color: COLORS.muted },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  content: { paddingHorizontal: 18, paddingBottom: 60 },

  endPills: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14, gap: PILL_GAP },
  endPillsLeft: { justifyContent: "center" },
  endPillsRight: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "flex-start" },
  pill: { borderRadius: 10, paddingVertical: 0, width: PILL_W, height: PILL_H, alignItems: "center", justifyContent: "center" },
  pillActive: { backgroundColor: COLORS.accent, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 5, elevation: 3 },
  pillIdle: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: COLORS.border },
  pillDisabled: { backgroundColor: "#f7f7f7", borderWidth: 1.5, borderColor: "#f0f0f0" },
  pillText: { fontSize: 11, fontWeight: "700" },
  pillTextActive: { color: "#fff" },
  pillTextIdle: { color: COLORS.text },
  pillTextDisabled: { color: "#ccc" },

  targetWrap: { alignItems: "center", marginVertical: 14 },

  legend: { flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: COLORS.sub },

  chips: { flexDirection: "row", gap: 5, marginBottom: 12 },
  chip: { flex: 1, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chipBordered: { borderWidth: 1, borderColor: "#ddd" },
  chipText: { fontSize: 14, fontWeight: "800" },

  statsCard: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 16 },
  statItem: { flex: 1, alignItems: "center" },
  statBorder: { borderRightWidth: 1, borderRightColor: "#f2f2f2" },
  statVal: { fontSize: 20, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});
