import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { COLORS } from "../constants";
import { sv } from "../utils/helpers";
import { Sec, TabToggle, Card } from "../components/UI";
import ScoreSheet from "../components/ScoreSheet";
import DistributionChart from "../components/DistributionChart";
import TargetFace from "../components/TargetFace";
import ConfettiCannon from "react-native-confetti-cannon";

export default function SessionScreen({ session, isNew = false, isPB = false, onBack, onUpdateLocation }) {
  const s = session;
  const isW = s.endsCount === 12;
  const allArr = s.ends?.flat() || [];
  const r1Total = isW ? s.ends?.slice(0, 6).flat().reduce((a, v) => a + sv(v), 0) : null;
  const r2Total = isW ? s.ends?.slice(6).flat().reduce((a, v) => a + sv(v), 0) : null;
  const total = allArr.reduce((a, v) => a + sv(v), 0);
  const hasSpan = s.spanData?.some(e => e.length > 0);
  const numEnds = s.ends?.length || 0;

  const [editLoc, setEditLoc]           = useState(false);
  const [locVal, setLocVal]             = useState(s.location || "");
  const [tab, setTab]                   = useState("score");
  const [viewEnd, setViewEnd]           = useState("all");
  const [showGrouping, setShowGrouping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(isNew && isPB);

  // PB haptics — fires for any PB session
  React.useEffect(() => {
    if (isNew && isPB) {
      const buzz = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 450);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 700);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 950);
      };
      buzz();
    }
  }, []);

  const saveLoc = () => {
    onUpdateLocation?.(locVal.trim());
    setEditLoc(false);
  };

  const selectedArrows = viewEnd === "all"
    ? (s.spanData?.flat() || [])
    : (s.spanData?.[viewEnd] || []);

  const selectedScores = viewEnd === "all"
    ? allArr
    : (s.ends?.[viewEnd] || []);

  const r1count = s.spanData?.slice(0, 6).flat().length || 0;
  const showR2  = isW && viewEnd === "all";
  const spTotal = selectedScores.reduce((a, v) => a + sv(v), 0);
  const spAvg   = selectedScores.length ? (spTotal / selectedScores.length).toFixed(1) : "–";
  const spBest  = selectedScores.length ? Math.max(...selectedScores.map(sv)) : "–";

  const calcGrouping = React.useCallback((arrows) => {
    if (!arrows || arrows.length < 2) return "–";
    const cx = arrows.reduce((s, a) => s + a.x, 0) / arrows.length;
    const cy = arrows.reduce((s, a) => s + a.y, 0) / arrows.length;
    const avgDist = arrows.reduce((s, a) => s + Math.sqrt((a.x - cx) ** 2 + (a.y - cy) ** 2), 0) / arrows.length;
    const score = 10 - (avgDist - 0.066) / (1.0 - 0.066) * 9;
    return Math.min(10, Math.max(1, score)).toFixed(1);
  }, []);
  const grouping = calcGrouping(selectedArrows);

  const handleToggleGrouping = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowGrouping(g => !g);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    onBack();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Confetti — always for any PB */}
      {showConfetti && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, pointerEvents: "none" }}>
          <ConfettiCannon
            count={200}
            origin={{ x: 200, y: -10 }}
            autoStart
            fadeOut
            explosionSpeed={200}
            fallSpeed={3000}
            colors={["#4f7ef7", "#ffd700", "#ff6b6b", "#51cf66", "#cc5de8", "#fff"]}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* ← Back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.metaLine}>
            {s.distance}  ·  {s.endsCount} ends  ·  {s.date}  ·  {s.time}
          </Text>

          {isNew ? (
            editLoc ? (
              <View style={styles.locRow}>
                <TextInput
                  autoFocus value={locVal}
                  onChangeText={setLocVal}
                  onSubmitEditing={saveLoc}
                  placeholder="e.g. Yumenoshima"
                  style={styles.locInput}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={saveLoc} style={styles.locSave}>
                  <Text style={styles.locSaveText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditLoc(false)} style={styles.locCancel}>
                  <Text style={styles.locCancelText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setLocVal(s.location || ""); setEditLoc(true); }} style={styles.locBtn}>
                <Text style={[styles.locBtnText, !s.location && styles.locBtnTextFaint]}>
                  📍 {s.location || "add location"}
                </Text>
              </TouchableOpacity>
            )
          ) : s.location ? (
            <Text style={styles.locStatic}>📍 {s.location}</Text>
          ) : null}

          <View style={styles.scoreRow}>
            <Text style={styles.score}>{total}</Text>
          </View>
          {isW && <Text style={styles.rounds}>{r1Total} + {r2Total}</Text>}
          <Text style={styles.outOf}>out of {s.endsCount * 60} · {Math.round(total / (s.endsCount * 60) * 100)}%</Text>

          {/* PB badge — always shows for any PB */}
          {isPB && (
            <View style={styles.pbBadge}>
              <Text style={styles.pbBadgeText}>🏆 Personal Best</Text>
            </View>
          )}
        </View>

        {/* Tab toggle */}
        {hasSpan && (
          <TabToggle
            value={tab}
            onChange={setTab}
            options={[{ value: "score", label: "Score card" }, { value: "span", label: "🎯 Arrow span" }]}
          />
        )}

        {/* Score tab */}
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

        {/* Span tab */}
        {tab === "span" && hasSpan && (
          <Sec>
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

            <View style={styles.targetWrap}>
              <TouchableOpacity activeOpacity={0.9} onPress={handleToggleGrouping}>
                <TargetFace
                  arrows={selectedArrows}
                  size={300}
                  r1Count={r1count}
                  showRoundColors={showR2}
                  showGrouping={showGrouping}
                />
              </TouchableOpacity>
              <Text style={styles.groupingHint}>{showGrouping ? "Tap to hide grouping" : "Tap to show grouping"}</Text>
            </View>

            {showR2 && (
              <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#1a1a1a" }]} /><Text style={styles.legendText}>Round 1</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} /><Text style={styles.legendText}>Round 2</Text></View>
              </View>
            )}

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

            <Card style={styles.statsCard}>
              {[
                { label: "Score",     val: spTotal  },
                { label: "Avg/arrow", val: spAvg    },
                { label: "Best",      val: spBest   },
                { label: "Grouping",  val: grouping },
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
    </View>
  );
}

function EndPill({ label, active, disabled, onPress, tall, isW }) {
  const { COLORS } = require("../constants");
  const PILL_W   = Math.floor((require("react-native").Dimensions.get("window").width - 36) / 7) - 4;
  const PILL_H   = 36;
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

  header:   { paddingTop: 32, paddingHorizontal: 18, paddingBottom: 0 },
  back:     { fontSize: 14, color: COLORS.muted },

  hero:     { paddingTop: 12, paddingHorizontal: 40, paddingBottom: 20, alignItems: "center" },
  metaLine: { fontSize: 12, color: COLORS.muted, marginBottom: 8, textAlign: "center" },
  score:    { fontSize: 84, fontWeight: "900", color: COLORS.text, letterSpacing: -3, lineHeight: 100 },
  rounds:   { fontSize: 14, color: COLORS.accent, fontWeight: "600", marginTop: 4 },
  outOf:    { fontSize: 13, color: COLORS.muted, marginTop: 6 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  pbBadge:     { backgroundColor: "#fff8e0", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8 },
  pbBadgeText: { fontSize: 12, fontWeight: "700", color: "#f0b400" },

  locRow:          { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  locInput:        { flex: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: "#d0deff", fontSize: 12, backgroundColor: "#fff", textAlign: "center" },
  locSave:         { backgroundColor: COLORS.accent, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  locSaveText:     { fontSize: 12, fontWeight: "700", color: "#fff" },
  locCancel:       { padding: 6 },
  locCancelText:   { fontSize: 14, color: COLORS.muted },
  locBtn:          { marginBottom: 10 },
  locBtnText:      { fontSize: 12, fontWeight: "500", color: "#888" },
  locBtnTextFaint: { color: COLORS.muted, textDecorationLine: "underline" },
  locStatic:       { fontSize: 12, color: COLORS.muted, marginBottom: 8 },

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

  targetWrap:   { alignItems: "center", marginVertical: 14 },
  groupingHint: { fontSize: 10, color: COLORS.muted, marginTop: 6 },
  legend:       { flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 10 },
  legendItem:   { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot:    { width: 12, height: 12, borderRadius: 6 },
  legendText:   { fontSize: 12, color: COLORS.sub },
  chips:        { flexDirection: "row", gap: 5, marginBottom: 12 },
  chip:         { flex: 1, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chipBordered: { borderWidth: 1, borderColor: "#ddd" },
  chipText:     { fontSize: 14, fontWeight: "800" },
  statsCard:    { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 16, marginTop: 8 },
  statItem:     { flex: 1, alignItems: "center" },
  statBorder:   { borderRightWidth: 1, borderRightColor: "#f2f2f2" },
  statVal:      { fontSize: 20, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  statLabel:    { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});