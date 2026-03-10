import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ARROWS_PER_END, ZONE, COLORS } from "../constants";
import { sv, countTens, countX } from "../utils/helpers";
import { Card } from "./UI";

export default function ScoreSheet({ ends, isW }) {
  const allArrows = ends.flat();
  const r1Arrows  = isW ? ends.slice(0, 6).flat() : [];
  const r2Arrows  = isW ? ends.slice(6).flat()    : [];
  const r1Total   = r1Arrows.reduce((s, a) => s + sv(a), 0);
  const r2Total   = r2Arrows.reduce((s, a) => s + sv(a), 0);
  const total     = allArrows.reduce((s, a) => s + sv(a), 0);
  const tens      = countTens(allArrows);
  const xs        = countX(allArrows);

  const SubtotalRow = ({ label, arr, total: t }) => (
    <View style={styles.subtotalRow}>
      <Text style={styles.subtotalLabel}>{label}</Text>
      <View style={styles.subtotalRight}>
        <Text style={styles.subtotalStats}>10+X: {countTens(arr)}  X: {countX(arr)}</Text>
        <Text style={styles.subtotalScore}>{t}</Text>
      </View>
    </View>
  );

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.endCell}><Text style={styles.headerText}>End</Text></View>
        {Array.from({ length: ARROWS_PER_END }).map((_, i) => (
          <View key={i} style={styles.arrowCell}>
            <Text style={styles.headerText}>{i + 1}</Text>
          </View>
        ))}
        <View style={styles.etCell}><Text style={[styles.headerText, styles.headerRight]}>ET</Text></View>
        <View style={styles.rtCell}><Text style={[styles.headerText, styles.headerRight, { color: COLORS.accent }]}>RT</Text></View>
      </View>

      {ends.map((end, i) => {
        const et = end.reduce((s, a) => s + sv(a), 0);
        const rt = ends.slice(0, i + 1).flat().reduce((s, a) => s + sv(a), 0);
        const isR2start = isW && i === 6;
        const isR2end   = isW && i === 11;
        return (
          <View key={i}>
            {isR2start && <SubtotalRow label="Round 1" arr={r1Arrows} total={r1Total} />}
            <View style={[styles.endRow, i % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
              <View style={styles.endCell}>
                <Text style={styles.endLabel}>
                  {isW ? `R${Math.floor(i / 6) + 1}·${(i % 6) + 1}` : `E${i + 1}`}
                </Text>
              </View>
              {end.map((a, j) => {
                const z = ZONE[a] || ZONE["M"];
                const bordered = a === 1 || a === 2;
                return (
                  <View key={j} style={styles.arrowCell}>
                    <View style={[styles.arrowChip, { backgroundColor: z.bg }, bordered && styles.arrowChipBordered]}>
                      <Text style={[styles.arrowChipText, { color: z.text }]}>{String(a)}</Text>
                    </View>
                  </View>
                );
              })}
              {/* fill empty slots */}
              {end.length < ARROWS_PER_END && Array.from({ length: ARROWS_PER_END - end.length }).map((_, k) => (
                <View key={`empty-${k}`} style={styles.arrowCell} />
              ))}
              <View style={styles.etCell}><Text style={styles.etText}>{et}</Text></View>
              <View style={styles.rtCell}><Text style={styles.rtText}>{rt}</Text></View>
            </View>
            {isR2end && <SubtotalRow label="Round 2" arr={r2Arrows} total={r2Total} />}
          </View>
        );
      })}

      {/* Totals */}
      <View style={styles.totalsRow}>
        <Text style={styles.totalsLabel}>Total</Text>
        <View style={styles.totalsRight}>
          <Text style={styles.totalsStats}>10+X: {tens}  X: {xs}</Text>
          <Text style={styles.totalsScore}>{total} / {ends.length * 60}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: "hidden" },
  headerRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 7, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
    backgroundColor: "#fafafa",
  },
  headerText: { fontSize: 9, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" },
  headerRight: { textAlign: "right" },
  endRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f8f8f8" },
  rowEven: { backgroundColor: "#fff"   },
  rowOdd:  { backgroundColor: "#fcfcfc" },
  endCell:  { width: 38 },
  arrowCell:{ flex: 1, alignItems: "center" },
  etCell:   { width: 28, alignItems: "flex-end" },
  rtCell:   { width: 34, alignItems: "flex-end" },
  endLabel: { fontSize: 10, color: COLORS.muted, fontWeight: "500" },
  arrowChip: {
    width: 20, height: 20, borderRadius: 4,
    alignItems: "center", justifyContent: "center",
  },
  arrowChipBordered: { borderWidth: 1, borderColor: "#ddd" },
  arrowChipText: { fontSize: 9, fontWeight: "800" },
  etText: { fontSize: 11, fontWeight: "700", color: COLORS.text },
  rtText: { fontSize: 11, fontWeight: "600", color: COLORS.accent },
  subtotalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 5, paddingHorizontal: 12,
    backgroundColor: "#f5f7ff",
    borderTopWidth: 1, borderTopColor: "#e8eeff",
    borderBottomWidth: 1, borderBottomColor: "#e8eeff",
  },
  subtotalLabel: { fontSize: 9, fontWeight: "700", color: COLORS.accent, textTransform: "uppercase", letterSpacing: 0.8 },
  subtotalRight: { flexDirection: "row", gap: 14, alignItems: "center" },
  subtotalStats: { fontSize: 9, color: COLORS.muted },
  subtotalScore: { fontSize: 11, fontWeight: "800", color: COLORS.accent },
  totalsRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8, paddingHorizontal: 12,
    borderTopWidth: 1.5, borderTopColor: "#efefef",
    backgroundColor: "#fafafa",
  },
  totalsLabel: { fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.8 },
  totalsRight:  { flexDirection: "row", gap: 14, alignItems: "center" },
  totalsStats:  { fontSize: 11, color: COLORS.sub, fontWeight: "600" },
  totalsScore:  { fontSize: 14, fontWeight: "900", color: COLORS.text },
});
