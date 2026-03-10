import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { COLORS } from "../constants";
import { sv, countTens, countX } from "../utils/helpers";
import { Sec, TabToggle } from "../components/UI";
import ScoreSheet from "../components/ScoreSheet";
import DistributionChart from "../components/DistributionChart";
import SpanViewScreen from "./SpanViewScreen";

export default function SessionDetailScreen({ session, onBack }) {
  const s = session;
  const [tab, setTab] = useState("score");
  const isW = s.endsCount === 12;
  const allArr  = s.ends?.flat() || [];
  const r1Arr   = isW ? s.ends?.slice(0, 6).flat() || [] : [];
  const r2Arr   = isW ? s.ends?.slice(6).flat()    || [] : [];
  const r1Total = r1Arr.reduce((a, v) => a + sv(v), 0);
  const r2Total = r2Arr.reduce((a, v) => a + sv(v), 0);
  const total   = allArr.reduce((a, v) => a + sv(v), 0);
  const hasSpan = s.spanData?.some(e => e.length > 0);

  // Show span inline via SpanViewScreen with custom back
  if (tab === "span" && hasSpan) {
    return <SpanViewScreen session={s} onBack={() => setTab("score")} />;
  }

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

      <Sec label="Score sheet">
        <ScoreSheet ends={s.ends} isW={isW} />
      </Sec>

      <Sec label="Arrow distribution">
        <DistributionChart arrows={allArr} />
      </Sec>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 60 },
  header:  { paddingTop: 56, paddingHorizontal: 18, paddingBottom: 4, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  back:    { fontSize: 14, color: COLORS.muted, paddingTop: 2 },
  titleBlock: { alignItems: "center" },
  title:   { fontSize: 15, fontWeight: "700", color: COLORS.text },
  meta:    { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  hero:    { alignItems: "center", paddingVertical: 20 },
  score:   { fontSize: 60, fontWeight: "900", color: COLORS.text, letterSpacing: -3, lineHeight: 64 },
  rounds:  { fontSize: 13, color: COLORS.accent, fontWeight: "600", marginTop: 4 },
  outOf:   { fontSize: 13, color: COLORS.muted, marginTop: 4 },
});
