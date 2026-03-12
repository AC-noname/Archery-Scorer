import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { COLORS, W_ROUNDS } from "../constants";
import { sv } from "../utils/helpers";
import { Sec, Card } from "../components/UI";
import LineChart from "../components/LineChart";
import SessionScreen from "./SessionScreen";
import * as Haptics from "expo-haptics";

export default function DistanceHistoryScreen({ distance, sessions, allEntries, onBack, onDelete }) {
  const [detailSession, setDetailSession] = useState(null);

  if (detailSession) {
    const distPB = Math.max(...sessions.filter(x => x.distance === detailSession.distance).map(x => x.total));
    return <SessionScreen session={detailSession} isPB={detailSession.total === distPB} onBack={() => setDetailSession(null)} />;
  }

  const count10X = (entry) =>
    (entry.ends?.flat() || []).filter(v => v === 10 || v === "X").length;

  const distEntries = (allEntries || [])
    .filter(e => e.distance === distance)
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return count10X(b) - count10X(a);
    });

  const getRank = (_, index) => index < 3 ? index : -1;
  const MEDALS = ["🥇", "🥈", "🥉"];
  const MEDAL_COLORS = ["#f0b400", "#a0a0a0", "#cd7f32"];

  const pb = distEntries.length ? Math.max(...distEntries.map(e => e.total)) : 0;
  const avg = distEntries.length
    ? Math.round(distEntries.reduce((s, e) => s + e.total, 0) / distEntries.length)
    : 0;
  const max = distEntries[0]?.endsCount === 12 ? 720 : 360;

  const chartEntries = (allEntries || [])
    .filter(e => e.distance === distance)
    .sort((a, b) => {
      const da = new Date(`${a.date} ${a.time}`);
      const db = new Date(`${b.date} ${b.time}`);
      return da - db;
    });

  const getRealSession = (entry) => {
    if (entry.fromW) {
      return sessions.find(s =>
        s.distance === entry.fromW &&
        s.date === entry.date &&
        s.time === entry.time
      );
    }
    return sessions.find(s =>
      s.distance === entry.distance &&
      s.date === entry.date &&
      s.time === entry.time
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onBack() }}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{distance}</Text>
          <Text style={styles.subtitle}>{distEntries.length} sessions</Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      {/* Stats row */}
      <Card style={styles.statsCard}>
        {[
          { label: "Personal Best", val: pb, highlight: true },
          { label: "Average", val: avg },
          { label: "Sessions", val: distEntries.length },
          { label: "Max possible", val: max },
        ].map((item, i) => (
          <View key={i} style={[styles.statItem, i < 3 && styles.statBorder]}>
            <Text style={[styles.statVal, item.highlight && styles.statValPB]}>{item.val}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </Card>

      {/* Chart */}
      {chartEntries.length >= 2 && (
        <Sec label="Score over time">
          <LineChart entries={chartEntries} pb={pb} />
        </Sec>
      )}

      {/* Session list */}
      <Sec label="All sessions">
        <View style={styles.listCard}>
          {distEntries.map((entry, i) => {
            const realSession = getRealSession(entry);
            if (!realSession) return null;
            const rank = getRank(entry, i);
            const isLast = i === distEntries.length - 1;

            return (
              <TouchableOpacity
                key={i}
                onPress={() => setDetailSession(realSession)}
                activeOpacity={0.6}
                style={[styles.listRow, !isLast && styles.listRowBorder]}
              >
                {/* Rank number */}
                <Text style={styles.rankNum}>#{i + 1}</Text>

                {/* Middle info */}
                <View style={styles.listMiddle}>
                  <View style={styles.listTitleRow}>
                    <Text style={styles.listDate}>{entry.date}</Text>
                  </View>
                  <Text style={styles.listLocation}>
                    {entry.time}{entry.location ? `  ${entry.location}` : ""}
                  </Text>
                </View>

                {/* Score + medal */}
                <View style={styles.scoreBlock}>
                  {rank >= 0 && <Text style={styles.medalRight}>{MEDALS[rank]}</Text>}
                  <Text style={[styles.listScore, rank === 0 && styles.listScoreGold, rank === 1 && styles.listScoreSilver, rank === 2 && styles.listScoreBronze]}>
                    {entry.total}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Sec>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 60 },
  header: { paddingTop: 35, paddingHorizontal: 18, paddingBottom: 16, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  back: { fontSize: 14, color: COLORS.muted, paddingTop: 4 },
  titleBlock: { alignItems: "center" },
  title: { fontSize: 28, fontWeight: "900", color: COLORS.text, letterSpacing: -1 },
  subtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  statsCard: { marginHorizontal: 18, flexDirection: "row", paddingVertical: 16, paddingHorizontal: 8 },
  statItem: { flex: 1, alignItems: "center" },
  statBorder: { borderRightWidth: 1, borderRightColor: "#f2f2f2" },
  statVal: { fontSize: 20, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  statValPB: { color: COLORS.accent },
  statLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2, textAlign: "center" },

  listCard: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, overflow: "hidden" },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 18, paddingHorizontal: 14, gap: 10 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f2f2f2" },
  rankNum: { width: 28, fontSize: 15, fontWeight: "700", color: "#ccc", textAlign: "center" },
  listMiddle: { flex: 1 },
  listTitleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  medal: { fontSize: 13 },
  listDate: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  listLocation: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  scoreBlock: { flexDirection: "row", alignItems: "center", gap: 4 },
  medalRight: { fontSize: 16 },
  listScore: { fontSize: 22, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  listScoreGold: { color: "#f0b400" },
  listScoreSilver: { color: "#a0a0a0" },
  listScoreBronze: { color: "#cd7f32" },
  chevron: { fontSize: 14, color: COLORS.muted },
});
