import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { COLORS, W_ROUNDS } from "../constants";
import { sv } from "../utils/helpers";
import { Sec, Card } from "../components/UI";
import SessionRow from "../components/SessionRow";
import LineChart from "../components/LineChart";
import SessionDetailScreen from "./SessionDetailScreen";

export default function DistanceHistoryScreen({ distance, sessions, allEntries, onBack, onDelete }) {
  const [detailSession, setDetailSession] = useState(null);

  if (detailSession) {
    return <SessionDetailScreen session={detailSession} onBack={() => setDetailSession(null)} />;
  }

  // Filter entries for this distance, sorted by score descending
  const distEntries = (allEntries || [])
    .filter(e => e.distance === distance)
    .sort((a, b) => b.total - a.total);

  const top3Scores = [...new Set(distEntries.map(e => e.total))].slice(0, 3);
  const getRank = (total) => top3Scores.indexOf(total); // 0=gold, 1=silver, 2=bronze, -1=none
  const MEDALS = ["🥇", "🥈", "🥉"];
  const MEDAL_COLORS = ["#f0b400", "#a0a0a0", "#cd7f32"];

  const pb = distEntries.length ? Math.max(...distEntries.map(e => e.total)) : 0;
  const avg = distEntries.length
    ? Math.round(distEntries.reduce((s, e) => s + e.total, 0) / distEntries.length)
    : 0;
  const max = distEntries[0]?.endsCount === 12 ? 720 : 360;

  // For chart — chronological order
  const chartEntries = (allEntries || [])
    .filter(e => e.distance === distance)
    .sort((a, b) => {
      const da = new Date(`${a.date} ${a.time}`);
      const db = new Date(`${b.date} ${b.time}`);
      return da - db;
    });

  // Find the real session object for a sub-round entry
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
        <TouchableOpacity onPress={onBack}>
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
        {distEntries.map((entry, i) => {
          const realSession = getRealSession(entry);
          if (!realSession) return null;

          // If it's a W sub-round, show it differently
          const isSubRound = !!entry.fromW && entry.fromW !== distance;
          const roundNum = isSubRound
            ? W_ROUNDS[entry.fromW]?.[0] === entry.distance ? "Round 1" : "Round 2"
            : null;

          return (
            <TouchableOpacity
              key={i}
              onPress={() => setDetailSession(realSession)}
              activeOpacity={0.7}
              style={styles.entryRow}
            >
              <View style={styles.entryLeft}>
                <View style={styles.entryTitleRow}>
                  <Text style={styles.entryDist}>{distance}</Text>
                  {getRank(entry.total) >= 0 && (
                    <View style={[styles.medalBadge, { backgroundColor: MEDAL_COLORS[getRank(entry.total)] + "22", borderColor: MEDAL_COLORS[getRank(entry.total)] + "44" }]}>
                      <Text style={[styles.medalText, { color: MEDAL_COLORS[getRank(entry.total)] }]}>
                        {MEDALS[getRank(entry.total)]} {getRank(entry.total) === 0 ? "Best" : getRank(entry.total) === 1 ? "2nd" : "3rd"}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.entryMeta}>
                  {entry.date} · {entry.time}
                  {entry.location ? `  📍 ${entry.location}` : ""}
                </Text>
              </View>
              <View style={styles.entryRight}>
                <Text style={[styles.entryScore, entry.total === pb && styles.entryScorePB]}>
                  {entry.total}
                </Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Sec>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 60 },
  header: { paddingTop: 56, paddingHorizontal: 18, paddingBottom: 16, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
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

  entryRow: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: 6,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  entryLeft: { flex: 1 },
  entryTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  entryDist: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  pbBadge: { backgroundColor: "#fff8e0", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  pbBadgeText: { fontSize: 10, color: "#f0b400", fontWeight: "700" },
  entryMeta: { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  entryRight: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: 10 },
  entryScore:    { fontSize: 20, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  entryScorePB:  { color: "#f0b400" },
  medalBadge:    { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  medalText:     { fontSize: 10, fontWeight: "700" },
  chevron: { fontSize: 14, color: COLORS.muted },
});
