import React, { useState } from "react";
import * as Haptics from "expo-haptics";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { COLORS, W_ROUNDS } from "../constants";
import { sv } from "../utils/helpers";
import { Sec, Card } from "../components/UI";
import SessionRow from "../components/SessionRow";
import LineChart from "../components/LineChart";
import DistanceHistoryScreen from "./DistanceHistoryScreen";
import SessionScreen from "./SessionScreen";

export default function ProgressScreen({ sessions, onBack, onDelete }) {
  const [chartTab, setChartTab] = useState(null);
  const [detailSession, setDetailSession] = useState(null);
  const [distanceHistory, setDistanceHistory] = useState(null);

  // Build flat entries including W sub-rounds
  const allEntries = [];
  sessions.forEach(s => {
    allEntries.push({ ...s, fromW: null });
    if (s.endsCount === 12 && W_ROUNDS[s.distance]) {
      const [d1, d2] = W_ROUNDS[s.distance];
      const r1 = s.ends?.slice(0, 6).flat().reduce((a, v) => a + sv(v), 0) ?? 0;
      const r2 = s.ends?.slice(6).flat().reduce((a, v) => a + sv(v), 0) ?? 0;
      allEntries.push({ ...s, distance: d1, total: r1, endsCount: 6, fromW: s.distance });
      allEntries.push({ ...s, distance: d2, total: r2, endsCount: 6, fromW: s.distance });
    }
  });

  if (detailSession) {
    const distPB = Math.max(...sessions.filter(x => x.distance === detailSession.distance).map(x => x.total));
    return <SessionScreen session={detailSession} isPB={detailSession.total === distPB} onBack={() => setDetailSession(null)} />;
  }

  if (distanceHistory) {
    return (
      <DistanceHistoryScreen
        distance={distanceHistory}
        sessions={sessions}
        allEntries={allEntries}
        onBack={() => setDistanceHistory(null)}
        onDelete={onDelete}
      />
    );
  }

  const distKeys = [...new Set(allEntries.map(e => e.distance))];

  const globalPBs = distKeys.map(d => {
    const entries = allEntries.filter(e => e.distance === d);
    const pb = Math.max(...entries.map(e => e.total));
    const pbEntry = entries.find(e => e.total === pb);
    return { distance: d, pb, count: entries.length, date: pbEntry?.date };
  }).sort((a, b) => {
    const maxA = allEntries.find(e => e.distance === a.distance)?.endsCount === 12 ? 720 : 360;
    const maxB = allEntries.find(e => e.distance === b.distance)?.endsCount === 12 ? 720 : 360;
    return (b.pb / maxB) - (a.pb / maxA);
  });

  const activeTab = chartTab || distKeys[0] || null;
  const tabEntries = allEntries.filter(e => e.distance === activeTab);
  const tabPB = tabEntries.length ? Math.max(...tabEntries.map(e => e.total)) : 0;
  const chrono = [...sessions].reverse();

  const openSession = (s) => setDetailSession(s);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Progress</Text>
          <Text style={styles.headerTitle}>{sessions.length} Sessions</Text>
        </View>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onBack()}}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>No sessions yet</Text></View>
      ) : (
        <>
          {/* Trophy wall */}
          <Sec label="Personal bests">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trophyScroll}>
              {globalPBs.map(item => {
                const pbSrc = allEntries.find(e => e.distance === item.distance && e.total === item.pb);
                const src = pbSrc?.fromW
                  ? sessions.find(s => s.distance === pbSrc.fromW && s.date === pbSrc.date && s.time === pbSrc.time)
                  : sessions.find(s => s.distance === item.distance && s.total === item.pb);
                return (
                  <TouchableOpacity
                    key={item.distance}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setDistanceHistory(item.distance); }}
                    activeOpacity={0.7}
                    style={styles.trophyCard}
                  >
                    <Text style={styles.trophyBadge}>🏆 PB</Text>
                    <Text style={styles.trophyScore}>{item.pb}</Text>
                    <Text style={styles.trophyDist}>{item.distance}</Text>
                    <Text style={styles.trophyDate}>{item.date || "–"}</Text>
                    <Text style={styles.trophyCount}>{item.count}× shot</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Sec>

          {/* Score over time */}
          <Sec label="Score over time">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
              {distKeys.map(d => (
                <TouchableOpacity
                  key={d} onPress={() => setChartTab(d)}
                  style={[styles.tab, activeTab === d && styles.tabActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, activeTab === d && styles.tabTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {tabEntries.length < 2 ? (
              <Card style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>Need at least 2 sessions to show chart</Text>
              </Card>
            ) : (
              <LineChart entries={tabEntries} pb={tabPB} />
            )}
          </Sec>

          {/* Session history */}
          <Sec label="Session history">
            {chrono.map((s, i) => {
              const realIndex = sessions.length - 1 - i;
              const distPB = Math.max(...sessions.filter(x => x.distance === s.distance).map(x => x.total));
              const isPB = s.total === distPB;
              return (
                <SessionRow key={i} session={s} onPress={() => openSession(s)} onDelete={() => onDelete(realIndex)} isPB={isPB} />
              );
            })}
          </Sec>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 60 },
  header: { paddingTop: 35, paddingHorizontal: 18, paddingBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerLabel: { fontSize: 11, fontWeight: "700", color: COLORS.accent, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: "900", color: COLORS.text, letterSpacing: -1 },
  back: { fontSize: 14, color: COLORS.muted, paddingTop: 6 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: COLORS.muted },

  trophyScroll: { paddingHorizontal: 0, gap: 8, paddingBottom: 4 },
  trophyCard: {
    width: 100, backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: 12,
  },
  trophyBadge: { fontSize: 9, fontWeight: "700", color: "#f0b400", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, backgroundColor: "#fff8e0", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, alignSelf: "flex-start" },
  trophyScore: { fontSize: 22, fontWeight: "900", color: COLORS.text, letterSpacing: -1 },
  trophyDist: { fontSize: 13, fontWeight: "700", color: COLORS.accent, marginTop: 2 },
  trophyDate: { fontSize: 9, color: "#ccc", marginTop: 5 },
  trophyCount: { fontSize: 9, color: "#ddd", marginTop: 1 },

  tabScroll: { gap: 6, paddingBottom: 8 },
  tab: { borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: "#fff", borderWidth: 1.5, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 5, elevation: 3 },
  tabText: { fontSize: 12, fontWeight: "700", color: COLORS.sub },
  tabTextActive: { color: "#fff" },

  chartPlaceholder: { alignItems: "center", paddingVertical: 20 },
  chartPlaceholderText: { fontSize: 13, color: COLORS.muted },
});
