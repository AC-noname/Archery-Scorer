import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line, Text as SvgText, G } from "react-native-svg";
import { TARGET_RINGS, ARROWS_PER_END } from "../constants";

export default React.memo(function TargetFace({
  arrows = [],
  onTap,
  size = 300,
  maxArrows = ARROWS_PER_END,
  r1Count = 0,
  showRoundColors = false,
  showGrouping = false,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 2;
  const canTap = !!onTap && arrows.length < maxArrows;

  const handlePress = (evt) => {
    if (!canTap) return;
    const { locationX, locationY } = evt.nativeEvent;
    const x = (locationX - cx) / maxR;
    const y = (locationY - cy) / maxR;
    onTap(x, y);
  };

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg
        width={size}
        height={size}
        style={{ borderRadius: size / 2 }}
      >
        {TARGET_RINGS.map((ring, i) => (
          <Circle
            key={i}
            cx={cx} cy={cy}
            r={ring.r * maxR}
            fill={ring.fill}
            stroke={ring.stroke}
            strokeWidth="0.6"
          />
        ))}
        <Line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
        <Line x1={cx} y1={cy - 9} x2={cx} y2={cy + 9} stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />

        {showGrouping && arrows.length >= 2 && (() => {
          const gcx = arrows.reduce((s, a) => s + a.x, 0) / arrows.length;
          const gcy = arrows.reduce((s, a) => s + a.y, 0) / arrows.length;
          const avgDist = arrows.reduce((s, a) => s + Math.sqrt((a.x - gcx) ** 2 + (a.y - gcy) ** 2), 0) / arrows.length;
          const px = cx + gcx * maxR;
          const py = cy + gcy * maxR;
          const pr = avgDist * maxR;
          const maxDist = Math.max(...arrows.map(a => Math.sqrt((a.x - gcx) ** 2 + (a.y - gcy) ** 2)));
          const pmaxR = maxDist * maxR;
          const color = "rgba(255,255,255,0.7)";
          return (
            <G>
              {/* Max range circle - dashed */}
              <Circle cx={px} cy={py} r={pmaxR} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="7,8" />
              {/* Avg grouping circle - solid */}
              <Circle cx={px} cy={py} r={pr} fill="none" stroke={color} strokeWidth="1.5" />
              {/* Cross extending to outer (max) circle */}
              <Line x1={px - pmaxR} y1={py} x2={px + pmaxR} y2={py} stroke={color} strokeWidth="1.5" />
              <Line x1={px} y1={py - pmaxR} x2={px} y2={py + pmaxR} stroke={color} strokeWidth="1.5" />
            </G>
          );
        })()}
        {arrows.map((a, i) => {
          const ax = cx + a.x * maxR;
          const ay = cy + a.y * maxR;
          const isR2 = showRoundColors && i >= r1Count;
          const col = isR2 ? "#4f7ef7" : "#1a1a1a";
          return (
            <G key={i}>
              <Circle cx={ax} cy={ay} r={8} fill="rgba(255,255,255,0.75)" stroke={col} strokeWidth="1.8" />
              <Circle cx={ax} cy={ay} r={2.5} fill={col} />
              <SvgText
                x={ax} y={ay - 12}
                fontSize="9" fontWeight="700"
                textAnchor="middle"
                fill={col}
                opacity="0.65"
              >
                {String(a.score)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
});
