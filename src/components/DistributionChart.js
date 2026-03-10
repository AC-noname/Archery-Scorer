import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SCORE_BUTTONS, ZONE } from "../constants";
import { Card } from "./UI";

export default function DistributionChart({ arrows }) {
  const counts = {};
  SCORE_BUTTONS.forEach(b => { counts[b] = 0; });
  arrows.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <Card>
      <View style={styles.wrap}>
        {SCORE_BUTTONS.map(s => {
          const count = counts[s] || 0;
          const pct   = count / maxCount;
          const z     = ZONE[s] || ZONE["M"];
          const bordered = s === 1 || s === 2;
          return (
            <View key={String(s)} style={styles.col}>
              {count > 0 && <Text style={styles.count}>{count}</Text>}
              <View style={[
                styles.bar,
                {
                  backgroundColor: count > 0 ? z.bg : "#f0f0f0",
                  height: count > 0 ? Math.max(pct * 52, 6) : 4,
                },
                bordered && count > 0 && styles.barBordered,
              ]} />
              <Text style={[styles.label, count === 0 && styles.labelFaint]}>{String(s)}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", height: 88, gap: 4 },
  col:  { flex: 1, alignItems: "center", gap: 3, height: "100%", justifyContent: "flex-end" },
  count: { fontSize: 9, fontWeight: "700", color: "#bbb" },
  bar:   { width: "100%", borderRadius: 4 },
  barBordered: { borderWidth: 1, borderColor: "#e0e0e0" },
  label: { fontSize: 9, fontWeight: "800", color: "#888" },
  labelFaint: { color: "#ccc" },
});
