import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line, Text as SvgText, G } from "react-native-svg";
import { TARGET_RINGS, ARROWS_PER_END } from "../constants";

export default function TargetFace({
  arrows = [],
  onTap,
  size = 300,
  maxArrows = ARROWS_PER_END,
  r1Count = 0,
  showRoundColors = false,
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
        onPress={handlePress}
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
}

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
