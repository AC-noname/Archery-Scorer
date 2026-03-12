import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { COLORS } from "../constants";

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Section ───────────────────────────────────────────────────────────────────
export function Sec({ label, children, style }) {
  return (
    <View style={[styles.sec, style]}>
      {label ? <Text style={styles.secLabel}>{label}</Text> : null}
      {children}
    </View>
  );
}

// ── Pill Button ───────────────────────────────────────────────────────────────
export function Pill({ label, active, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.pill,
        active ? styles.pillActive : styles.pillInactive,
        style,
      ]}
    >
      <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Mode Slider ───────────────────────────────────────────────────────────────
export function ModeSlider({ value, onChange }) {
  const isSpan = value === "span";
  return (
    <View style={styles.sliderTrack}>
      <View style={[styles.sliderThumb, isSpan ? styles.sliderRight : styles.sliderLeft]} />
      <TouchableOpacity style={styles.sliderHalf} onPress={() => { Haptics.selectionAsync(); onChange("score"); }} activeOpacity={0.7}>
        <Text style={[styles.sliderLabel, !isSpan && styles.sliderLabelActive]}>Score</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sliderHalf} onPress={() => { Haptics.selectionAsync(); onChange("span"); }} activeOpacity={0.7}>
        <Text style={[styles.sliderLabel, isSpan && styles.sliderLabelActive]}>🎯 Span</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Score Chip ────────────────────────────────────────────────────────────────
export function ScoreChip({ value, size = 34 }) {
  const { ZONE } = require("../constants");
  const z = ZONE[value] || ZONE["M"];
  const bordered = value === 1 || value === 2;
  return (
    <View style={[
      styles.scoreChip,
      { width: size, height: size, backgroundColor: z.bg },
      bordered && styles.scoreChipBordered,
    ]}>
      <Text style={[styles.scoreChipText, { color: z.text, fontSize: size * 0.38 }]}>
        {String(value)}
      </Text>
    </View>
  );
}

// ── Section Toggle (Score card / Arrow span) ──────────────────────────────────
export function TabToggle({ value, onChange, options }) {
  return (
    <View style={styles.tabToggleWrap}>
      <View style={styles.tabToggle}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => { Haptics.selectionAsync(); onChange(opt.value); }}
            activeOpacity={0.7}
            style={[styles.tabOption, value === opt.value && styles.tabOptionActive]}
          >
            <Text style={[styles.tabOptionText, value === opt.value && styles.tabOptionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sec: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  secLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  pill: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    flexShrink: 0,
  },
  pillActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  pillInactive: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  pillText: { fontSize: 13, fontWeight: "700" },
  pillTextActive:   { color: "#fff" },
  pillTextInactive: { color: COLORS.sub },

  sliderTrack: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 99,
    padding: 3,
    height: 38,
    width: 190,
    position: "relative",
    alignItems: "center",
  },
  sliderThumb: {
    position: "absolute",
    top: 3,
    width: "49%",
    height: 32,
    backgroundColor: "#fff",
    borderRadius: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  sliderLeft:  { left: 3   },
  sliderRight: { left: "51%" },
  sliderHalf:  { flex: 1, alignItems: "center", zIndex: 1 },
  sliderLabel: { fontSize: 13, fontWeight: "700", color: COLORS.muted },
  sliderLabelActive: { color: COLORS.text },

  scoreChip: {
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreChipBordered: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  scoreChipText: { fontWeight: "800" },

  tabToggleWrap: { alignItems: "center", paddingVertical: 4 },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 3,
  },
  tabOption: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  tabOptionActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabOptionText: { fontSize: 13, fontWeight: "700", color: COLORS.muted },
  tabOptionTextActive: { color: COLORS.text },
});
