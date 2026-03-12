import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { DIST_6, DIST_12, COLORS } from "../constants";
import { ModeSlider, Sec, Card } from "../components/UI";
import SessionRow from "../components/SessionRow";

export default function HomeScreen({ sessions, location, onSetLocation, onStart, onOpenSession, onProgress, onDeleteSession, archerName, onSetName }) {
  const [endsCount, setEndsCount]     = useState(6);
  const [pendingDist, setPendingDist] = useState(null);
  const [sessionMode, setSessionMode] = useState("score");
  const [editingLoc, setEditingLoc]   = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState("");
  const [locInput, setLocInput]       = useState(location);
  const [customDist, setCustomDist]   = useState("");
  const [editingCustom, setEditingCustom] = useState(false);

  const distOptions = endsCount === 6 ? DIST_6 : DIST_12;
  const recent = sessions.slice(-3).reverse();

  const handleSwitchEnds = (n) => {
    Haptics.selectionAsync();
    setEndsCount(n);
    setPendingDist(null);
    setEditingCustom(false);
  };

  const handleDistPress = (d) => {
    if (d.label === "Custom") {
      setEditingCustom(true);
      setPendingDist(null);
    } else {
      setPendingDist(d.label);
      setEditingCustom(false);
    }
  };

  const handleCustomConfirm = () => {
    if (customDist.trim()) {
      setPendingDist(customDist.trim());
      setEditingCustom(false);
    }
  };

  const handleStart = () => {
    if (!pendingDist) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart({ distance: pendingDist, endsCount, sessionMode });
    setPendingDist(null);
  };

  const saveLoc = () => {
    onSetLocation(locInput.trim());
    setEditingLoc(false);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appLabel}>Archery Scorer</Text>
        {editingName ? (
          <View style={styles.nameRow}>
            <TextInput
              autoFocus
              value={nameInput}
              onChangeText={setNameInput}
              onSubmitEditing={() => { onSetName(nameInput.trim() || "Archer"); setEditingName(false); }}
              placeholder="Your name"
              style={styles.nameInput}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => { onSetName(nameInput.trim() || "Archer"); setEditingName(false); }} style={styles.nameDoneBtn}>
              <Text style={styles.nameDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => { setNameInput(archerName); setEditingName(true); }}>
            <Text style={styles.appTitle}>Hi, {archerName}! 🏹</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Location */}
      <View style={styles.locWrap}>
        {editingLoc ? (
          <View style={styles.locRow}>
            <TextInput
              autoFocus
              value={locInput}
              onChangeText={setLocInput}
              onSubmitEditing={saveLoc}
              placeholder="e.g. Yumenoshima"
              style={styles.locInput}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={saveLoc} style={styles.locDoneBtn}>
              <Text style={styles.locDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => { setLocInput(location); setEditingLoc(true); }} style={[styles.locPill, location ? styles.locPillSet : styles.locPillUnset]}>
            <Text style={[styles.locPillText, location ? styles.locPillTextSet : styles.locPillTextUnset]}>
              📍 {location || "Set location"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Start a session */}
      <Sec label="Start a session">
        {/* Ends toggle */}
        <View style={styles.endsToggle}>
          {[6, 12].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => handleSwitchEnds(n)}
              activeOpacity={0.7}
              style={[styles.endsBtn, endsCount === n && styles.endsBtnActive]}
            >
              <Text style={[styles.endsBtnText, endsCount === n && styles.endsBtnTextActive]}>
                {n === 6 ? "6 ends" : "12 ends (W)"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Distance grid */}
        <View style={styles.grid}>
          {distOptions.map(d => {
            const isCustom = d.label === "Custom";
            const sel = isCustom
              ? pendingDist !== null && pendingDist === (customDist || "Custom")
              : pendingDist === d.label;
            return (
              <View key={d.label} style={styles.gridItem}>
                <TouchableOpacity
                  onPress={() => handleDistPress(d)}
                  activeOpacity={0.8}
                  style={[styles.distCard, sel && styles.distCardActive]}
                >
                  <Text style={[styles.distLabel, sel && styles.distLabelActive]}>
                    {isCustom && customDist ? customDist : d.label}
                  </Text>
                  <Text style={[styles.distSub, sel && styles.distSubActive]}>{d.sub}</Text>
                </TouchableOpacity>
                {isCustom && editingCustom && (
                  <View style={styles.customRow}>
                    <TextInput
                      autoFocus
                      value={customDist}
                      onChangeText={setCustomDist}
                      onSubmitEditing={handleCustomConfirm}
                      placeholder="e.g. 18m"
                      style={styles.customInput}
                      returnKeyType="done"
                    />
                    <TouchableOpacity onPress={handleCustomConfirm} style={styles.customSet}>
                      <Text style={styles.customSetText}>Set</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Mode + Start */}
        {pendingDist && (
          <Card style={styles.startCard}>
            <View style={styles.startRow}>
              <Text style={styles.startRowLabel}>Recording</Text>
              <ModeSlider value={sessionMode} onChange={setSessionMode} />
            </View>
            <TouchableOpacity onPress={handleStart} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Start {pendingDist} · {endsCount} ends →</Text>
            </TouchableOpacity>
          </Card>
        )}
      </Sec>

      {/* Recent sessions */}
      {recent.length > 0 && (
        <Sec label="Recent sessions">
          {recent.map((s, i) => {
            const distPB = Math.max(...sessions.filter(x => x.distance === s.distance).map(x => x.total));
            const isPB = s.total === distPB;
            return (
              <SessionRow key={i} session={s} isPB={isPB} onPress={() => onOpenSession(s)} onDelete={() => onDeleteSession(sessions.length - 1 - i)} />
            );
          })}
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onProgress(); }} style={styles.progressBtn}>
            <Text style={styles.progressBtnText}>View all progress →</Text>
          </TouchableOpacity>
        </Sec>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:   { flex: 1, backgroundColor: COLORS.bg },
  content:  { paddingBottom: 60 },
  header:   { paddingHorizontal: 18, paddingTop: 35, paddingBottom: 16 },
  appLabel: { fontSize: 11, fontWeight: "700", color: COLORS.accent, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 },
  appTitle: { fontSize: 32, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5, marginTop: 4 },
  locWrap:  { paddingHorizontal: 18, marginBottom: 4 },
  locRow:   { flexDirection: "row", gap: 8 },
  locInput: { flex: 1, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: "#d0deff", fontSize: 12, backgroundColor: "#fff" },
  locDoneBtn:     { backgroundColor: COLORS.accent, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 16, justifyContent: "center" },
  locDoneText:    { fontSize: 12, fontWeight: "700", color: "#fff" },
  locPill:        { borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14, alignSelf: "flex-start" },
  locPillSet:     { backgroundColor: COLORS.accentBg, borderWidth: 1.5, borderColor: "#d0deff" },
  locPillUnset:   { backgroundColor: "#f5f5f5", borderWidth: 1.5, borderColor: "#ebebeb" },
  locPillText:    { fontSize: 12, fontWeight: "600" },
  locPillTextSet: { color: COLORS.accent },
  locPillTextUnset: { color: COLORS.muted },

  nameRow:      { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 },
  nameInput:    { flex: 1, fontSize: 28, fontWeight: "900", color: COLORS.text, borderBottomWidth: 2, borderBottomColor: COLORS.accent, paddingVertical: 2 },
  nameDoneBtn:  { backgroundColor: COLORS.accent, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  nameDoneText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  endsToggle: { flexDirection: "row", backgroundColor: "#f0f0f0", borderRadius: 14, padding: 4, marginBottom: 14 },
  endsBtn:    { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 11 },
  endsBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  endsBtnText:       { fontSize: 14, fontWeight: "700", color: COLORS.muted },
  endsBtnTextActive: { color: COLORS.text },

  grid:     { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: { width: "47.5%" },
  distCard: { backgroundColor: "#fff", borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: COLORS.border },
  distCardActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 4 },
  distLabel:       { fontSize: 22, fontWeight: "900", letterSpacing: -1, color: COLORS.text },
  distLabelActive: { color: "#fff" },
  distSub:         { fontSize: 11, marginTop: 4, color: COLORS.muted },
  distSubActive:   { color: "rgba(255,255,255,0.7)" },

  customRow:   { flexDirection: "row", gap: 6, marginTop: 6 },
  customInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1.5, borderColor: "#d0deff", fontSize: 13, backgroundColor: "#fff" },
  customSet:   { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, justifyContent: "center" },
  customSetText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  startCard: { marginTop: 14, padding: 14 },
  startRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  startRowLabel: { fontSize: 13, color: COLORS.muted, fontWeight: "500" },
  startBtn:      { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 13, alignItems: "center", shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4 },
  startBtnText:  { fontSize: 14, fontWeight: "700", color: "#fff" },

  progressBtn:     { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 13, alignItems: "center", marginTop: 2 },
  progressBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
});
