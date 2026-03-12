import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../constants";
import { sv } from "../utils/helpers";

let openSwipeable = null;

export default function SessionRow({ session, onPress, onDelete, isPB }) {
  const s = session;
  const swipeRef = useRef(null);
  const isW = s.endsCount === 12;
  const r1 = isW ? s.ends?.slice(0, 6).flat().reduce((a, v) => a + sv(v), 0) : null;
  const r2 = isW ? s.ends?.slice(6).flat().reduce((a, v) => a + sv(v), 0) : null;
  const hasSpan = s.spanData?.some(e => e.length > 0);

  const renderRightActions = () => (
    <Pressable
      onPress={() => { swipeRef.current?.close(); onDelete && onDelete(); }}
      style={styles.deleteBtn}
    >
      <Text style={styles.deleteBtnText}>Delete</Text>
    </Pressable>
  );

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        friction={2}
        overshootRight={false}
        shouldCancelWhenOutside={false}
        enableTrackpadTwoFingerGesture
        onSwipeableOpen={() => {
          if (openSwipeable && openSwipeable !== swipeRef.current) openSwipeable.close();
          openSwipeable = swipeRef.current;
        }}
        onSwipeableClose={() => {
          if (openSwipeable === swipeRef.current) openSwipeable = null;
        }}
      >
        <Pressable onPress={onPress} style={styles.row}>
          <View style={styles.left}>

            <View style={styles.topRow}>
              <Text style={styles.dist}>{s.distance} </Text>
              {hasSpan && (
                <View style={styles.spanBadge}>
                  <Text style={styles.spanBadgeText}>🎯 Span</Text>
                </View>
              )}
              {isPB && (
                <View style={styles.pbBadge}>
                  <Text style={styles.pbBadgeText}>🏆 PB</Text>
                </View>
              )}
              {isW && r1 !== null && (
                <Text style={styles.rounds}> {r1} + {r2}</Text>
              )}
            </View>

            <Text style={styles.meta}>
              {s.date} · {s.time}{s.location ? `   ${s.location}` : ""}
            </Text>

          </View>

          <View style={styles.right}>
            <Text style={styles.score}>{s.total}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#ff3b30", borderRadius: 14, marginBottom: 8, overflow: "hidden" },
  deleteBtn: { backgroundColor: "#ff3b30", width: 80, alignItems: "center", justifyContent: "center" },
  deleteBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  row: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 14, gap: 10 },

  left: { flex: 1, gap: 4 },
  topRow:   { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  dist: { fontSize: 16, fontWeight: "900", color: COLORS.text, letterSpacing: -0.3 },
  rounds: { fontSize: 11, fontWeight: "700", color: COLORS.sub },
  meta: { fontSize: 11, color: COLORS.muted },
  spanBadge: { backgroundColor: COLORS.accentBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  spanBadgeText: { fontSize: 10, fontWeight: "700", color: COLORS.accent },
  pbBadge:       { backgroundColor: "#fff8e0", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  pbBadgeText:   { fontSize: 10, fontWeight: "700", color: "#f0b400" },

  right: { flexDirection: "row", alignItems: "center", gap: 4 },
  score: { fontSize: 22, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  chevron: { fontSize: 14, color: COLORS.muted },
});