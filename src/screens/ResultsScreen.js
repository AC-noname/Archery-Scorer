import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, StyleSheet,
} from "react-native";
import { COLORS } from "../constants";
import { sv } from "../utils/helpers";
import { Sec } from "../components/UI";
import ScoreSheet from "../components/ScoreSheet";
import DistributionChart from "../components/DistributionChart";

export default function ResultsScreen({ session, onHome, onViewSpan, onUpdateLocation }) {
  const s = session;
  const isW = s.endsCount === 12;
  const allArrows = s.ends.flat();
  const r1Total = isW ? s.ends.slice(0, 6).flat().reduce((a, v) => a + sv(v), 0) : null;
  const r2Total = isW ? s.ends.slice(6).flat().reduce((a, v) => a + sv(v), 0)    : null;
  const hasSpan = s.spanData?.some(e => e.length > 0);

  const [editLoc, setEditLoc]   = useState(false);
  const [locVal, setLocVal]     = useState(s.location || "");

  const saveLoc = () => {
    onUpdateLocation(locVal.trim());
    setEditLoc(false);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.metaLine}>
          {s.distance}  ·  {s.endsCount} ends  ·  {s.date}  ·  {s.time}
        </Text>

        {/* Location */}
        {editLoc ? (
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
        )}

        <Text style={styles.score}>{s.total}</Text>
        {isW && <Text style={styles.rounds}>{r1Total} + {r2Total}</Text>}
        <Text style={styles.outOf}>out of {s.endsCount * 60} · {Math.round(s.total / (s.endsCount * 60) * 100)}%</Text>
      </View>

      <Sec label="Score sheet">
        <ScoreSheet ends={s.ends} isW={isW} />
      </Sec>

      <Sec label="Arrow distribution">
        <DistributionChart arrows={allArrows} />
      </Sec>

      {/* Buttons */}
      <View style={styles.btnRow}>
        {hasSpan && (
          <TouchableOpacity onPress={onViewSpan} style={styles.btnSpan}>
            <Text style={styles.btnSpanText}>View span 🎯</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onHome} style={styles.btnHome}>
          <Text style={styles.btnHomeText}>Back to home</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.bg, overflow: "visible" },
  content:  {},
  hero:     { paddingTop: 48, paddingHorizontal: 40, paddingBottom: 20, alignItems: "center"},
  metaLine: { fontSize: 12, color: COLORS.muted, marginBottom: 10, textAlign: "center" },
  score:    { fontSize: 84, fontWeight: "900", color: COLORS.text, letterSpacing: -3, lineHeight: 100 },
  rounds:   { fontSize: 14, color: COLORS.accent, fontWeight: "600", marginTop: 4 },
  outOf:    { fontSize: 13, color: COLORS.muted, marginTop: 6 },

  locRow:    { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  locInput:  { flex: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: "#d0deff", fontSize: 12, backgroundColor: "#fff", textAlign: "center" },
  locSave:   { backgroundColor: COLORS.accent, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  locSaveText:   { fontSize: 12, fontWeight: "700", color: "#fff" },
  locCancel:     { padding: 6 },
  locCancelText: { fontSize: 14, color: COLORS.muted },
  locBtn:        { marginBottom: 10 },
  locBtnText:    { fontSize: 12, fontWeight: "500", color: "#888" },
  locBtnTextFaint: { color: COLORS.muted, textDecorationLine: "underline" },

  btnRow:  { flexDirection: "row", gap: 10, paddingHorizontal: 18, paddingTop: 16 },
  btnSpan: { flex: 1, backgroundColor: COLORS.accentBg, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  btnSpanText: { fontSize: 13, fontWeight: "700", color: COLORS.accent },
  btnHome:     { flex: 1, backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  btnHomeText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
