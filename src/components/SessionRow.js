import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../constants";
import { sv } from "../utils/helpers";

// Track the currently open swipeable globally
let openSwipeable = null;

export default function SessionRow({ session, onPress, onDelete }) {
  const s = session;
  const swipeRef = useRef(null);
  const isW = s.endsCount === 12;
  const r1 = isW ? s.ends?.slice(0, 6).flat().reduce((a, v) => a + sv(v), 0) : null;
  const r2 = isW ? s.ends?.slice(6).flat().reduce((a, v) => a + sv(v), 0) : null;
  const hasSpan = s.spanData?.some(e => e.length > 0);

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={() => { swipeRef.current?.close(); onDelete && onDelete(); }}
      style={styles.deleteBtn}
    >
      <Text style={styles.deleteBtnText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        friction={2}
        overshootRight={false}
        onSwipeableOpen={() => {
          if (openSwipeable && openSwipeable !== swipeRef.current) {
            openSwipeable.close();
          }
          openSwipeable = swipeRef.current;
        }}
        onSwipeableClose={() => {
          if (openSwipeable === swipeRef.current) openSwipeable = null;
        }}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
          <View style={styles.left}>
            <View style={styles.titleRow}>
              <Text style={styles.dist}>{s.distance}</Text>
              <Text style={styles.ends}>· {s.endsCount} ends</Text>
              {hasSpan && <Text style={styles.spanDot}>🎯</Text>}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{s.date} · {s.time}</Text>
              {s.location ? <Text style={styles.meta}>  📍 {s.location}</Text> : null}
              {isW && r1 !== null ? <Text style={styles.rounds}>  R1: {r1} · R2: {r2}</Text> : null}
            </View>
          </View>
          <View style={styles.right}>
            <Text style={styles.score}>{s.total}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  deleteBtn: { backgroundColor: "#ff3b30", borderRadius: 14, width: 80, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  deleteBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  row: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 14, marginBottom: 6 },
  left:     { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dist:     { fontSize: 14, fontWeight: "700", color: COLORS.text },
  ends:     { fontSize: 11, color: COLORS.muted },
  spanDot:  { fontSize: 10, color: COLORS.accent },
  metaRow:  { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  meta:     { fontSize: 11, color: COLORS.muted },
  rounds:   { fontSize: 11, color: "#aaa" },
  right:    { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: 10 },
  score:    { fontSize: 20, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  chevron:  { fontSize: 14, color: COLORS.muted },
});