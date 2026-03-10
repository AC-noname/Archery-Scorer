import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { SCORE_BUTTONS, ARROWS_PER_END, ZONE, COLORS, TARGET_RINGS } from "../constants";
import { sv } from "../utils/helpers";
import { xyToScore } from "../utils/helpers";
import TargetFace from "../components/TargetFace";
import Svg, { Circle, Line, Text as SvgText, G } from "react-native-svg";

function SpanTarget({ arrows, onPlace, onUndo, maxArrows, onPressIn, onPressOut }) {
  const [loupe, setLoupe] = useState(null);
  const viewRef = useRef(null);
  const holdTimer = useRef(null);
  const lastPos = useRef(null);
  const SIZE = 300;
  const LOUPE = 110;
  const ZOOM = 2.8;
  const cx = SIZE / 2, cy = SIZE / 2, maxR = SIZE / 2 - 2;
  const canPlace = arrows.length < maxArrows;

  const getPos = (pageX, pageY, callback) => {
    viewRef.current?.measure((fx, fy, w, h, px, py) => {
      const lx = pageX - px;
      const ly = pageY - py;
      const nx = (lx - cx) / maxR;
      const ny = (ly - cy) / maxR;
      callback({ px: lx, py: ly, nx, ny });
    });
  };

  const handleGrant = (e) => {
    if (!canPlace) return;
    onPressIn?.();
    const { pageX, pageY } = e.nativeEvent;
    // Save position immediately but wait 150ms before showing loupe
    getPos(pageX, pageY, (pos) => {
      lastPos.current = pos;
      holdTimer.current = setTimeout(() => {
        setLoupe(lastPos.current);
      }, 150);
    });
  };

  const handleMove = (e) => {
    if (!canPlace) return;
    const { pageX, pageY } = e.nativeEvent.touches[0];
    getPos(pageX, pageY, (pos) => {
      lastPos.current = pos;
      // Only update loupe position if it's already showing
      setLoupe(prev => prev ? pos : prev);
    });
  };

  const handleRelease = () => {
    onPressOut?.();
    clearTimeout(holdTimer.current);
    if (!canPlace) return;
    if (lastPos.current) onPlace(lastPos.current.nx, lastPos.current.ny);
    setLoupe(null);
    lastPos.current = null;
  };

  const handleCancel = () => {
    onPressOut?.();
    clearTimeout(holdTimer.current);
    setLoupe(null);
    lastPos.current = null;
  };

  return (
    <View style={{ alignItems: "center" }}>
      <View
        ref={viewRef}
        style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 4 }}
        onStartShouldSetResponder={() => canPlace}
        onMoveShouldSetResponder={() => canPlace}
        onResponderGrant={handleGrant}
        onResponderMove={handleMove}
        onResponderRelease={handleRelease}
        onResponderTerminate={handleCancel}
      >
        <Svg width={SIZE} height={SIZE}>
          {TARGET_RINGS.map((ring, i) => (
            <Circle key={i} cx={cx} cy={cy} r={ring.r * maxR} fill={ring.fill} stroke={ring.stroke} strokeWidth="0.6" />
          ))}
          <Line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
          <Line x1={cx} y1={cy - 9} x2={cx} y2={cy + 9} stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
          {arrows.map((a, i) => {
            const ax = cx + a.x * maxR, ay = cy + a.y * maxR;
            return (
              <G key={i}>
                <Circle cx={ax} cy={ay} r={8} fill="rgba(255,255,255,0.75)" stroke="#1a1a1a" strokeWidth="1.8" />
                <Circle cx={ax} cy={ay} r={2.5} fill="#1a1a1a" />
                <SvgText x={ax} y={ay - 12} fontSize="9" fontWeight="700" textAnchor="middle" fill="#1a1a1a" opacity="0.65">{String(a.score)}</SvgText>
              </G>
            );
          })}
          {loupe && (() => {
            const lx = cx + loupe.nx * maxR, ly = cy + loupe.ny * maxR;
            return (
              <G>
                <Circle cx={lx} cy={ly} r={8} fill="rgba(79,126,247,0.3)" stroke="#4f7ef7" strokeWidth="1.5" />
                <Circle cx={lx} cy={ly} r={2.5} fill="#4f7ef7" />
              </G>
            );
          })()}
        </Svg>

        {loupe && (() => {
          const { xyToScore } = require("../utils/helpers");
          const score = xyToScore(loupe.nx, loupe.ny);
          const { ZONE } = require("../constants");
          const z = ZONE[score];
          const loupeX = Math.min(Math.max(loupe.px - LOUPE / 2, 0), SIZE - LOUPE);
          const loupeY = Math.max(loupe.py - LOUPE - 24, 4);
          const offX = -(loupe.px * ZOOM - LOUPE / 2);
          const offY = -(loupe.py * ZOOM - LOUPE / 2);
          return (
            <View style={{
              position: "absolute", left: loupeX, top: loupeY,
              width: LOUPE, height: LOUPE, borderRadius: LOUPE / 2,
              overflow: "hidden",
              borderWidth: 2.5, borderColor: "#fff",
              shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 8,
              elevation: 10,
            }}>
              <View style={{ position: "absolute", left: offX, top: offY, width: SIZE * ZOOM, height: SIZE * ZOOM }}>
                <Svg width={SIZE * ZOOM} height={SIZE * ZOOM}>
                  {TARGET_RINGS.map((ring, i) => (
                    <Circle key={i} cx={cx * ZOOM} cy={cy * ZOOM} r={ring.r * maxR * ZOOM} fill={ring.fill} stroke={ring.stroke} strokeWidth="1" />
                  ))}
                  {arrows.map((a, i) => {
                    const ax = cx * ZOOM + a.x * maxR * ZOOM, ay = cy * ZOOM + a.y * maxR * ZOOM;
                    return (
                      <G key={i}>
                        <Circle cx={ax} cy={ay} r={8 * ZOOM} fill="rgba(255,255,255,0.75)" stroke="#1a1a1a" strokeWidth="1.8" />
                        <Circle cx={ax} cy={ay} r={2.5 * ZOOM} fill="#1a1a1a" />
                      </G>
                    );
                  })}
                  {(() => {
                    const lx = cx * ZOOM + loupe.nx * maxR * ZOOM;
                    const ly = cy * ZOOM + loupe.ny * maxR * ZOOM;
                    return (
                      <G>
                        <Circle cx={lx} cy={ly} r={9 * ZOOM} fill="rgba(79,126,247,0.25)" stroke="#4f7ef7" strokeWidth="2" />
                        <Circle cx={lx} cy={ly} r={2.5 * ZOOM} fill="#4f7ef7" />
                        <Line x1={lx - 14} y1={ly} x2={lx + 14} y2={ly} stroke="#4f7ef7" strokeWidth="1.5" opacity="0.6" />
                        <Line x1={lx} y1={ly - 14} x2={lx} y2={ly + 14} stroke="#4f7ef7" strokeWidth="1.5" opacity="0.6" />
                      </G>
                    );
                  })()}
                </Svg>
              </View>
              <View style={{ position: "absolute", bottom: 6, alignSelf: "center", backgroundColor: z.bg, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: score === 1 || score === 2 ? 1 : 0, borderColor: "#ddd" }}>
                <Text style={{ fontSize: 13, fontWeight: "900", color: z.text }}>{String(score)}</Text>
              </View>
            </View>
          );
        })()}
      </View>

      <TouchableOpacity onPress={onUndo} style={styles.undoBtn}>
        <Text style={styles.undoBtnText}>⟵ Undo</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RecordingScreen({ distance, endsCount, sessionMode, onFinish, onHome }) {
  const [curEnd, setCurEnd] = useState(0);
  const [isPressingTarget, setIsPressingTarget] = useState(false);
  const [ends, setEnds] = useState(Array.from({ length: endsCount }, () => []));
  const [spanData, setSpanData] = useState(Array.from({ length: endsCount }, () => []));

  const isSpan = sessionMode === "span";
  const isW = endsCount === 12;
  const roundNum = isW ? (curEnd < 6 ? 1 : 2) : null;
  const endInRound = isW ? (curEnd % 6) + 1 : curEnd + 1;

  const curEndArrows = ends[curEnd] || [];
  const curEndSpan = spanData[curEnd] || [];
  const runningTotal = ends.flat().reduce((s, a) => s + sv(a), 0);
  const r1Total = isW && curEnd >= 6 ? ends.slice(0, 6).flat().reduce((s, a) => s + sv(a), 0) : null;

  function advanceEnd(newEnds, newSpan) {
    if (curEnd + 1 >= endsCount) {
      onFinish(newEnds, newSpan);
    } else {
      setCurEnd(e => e + 1);
    }
  }

  function addScore(score) {
    if (curEndArrows.length >= ARROWS_PER_END) return;
    const newEnds = ends.map((e, i) => i === curEnd ? [...e, score] : e);
    setEnds(newEnds);
    if (curEndArrows.length + 1 >= ARROWS_PER_END) {
      setTimeout(() => advanceEnd(newEnds, spanData), 180);
    }
  }

  function undoScore() {
    if (!curEndArrows.length) return;
    setEnds(ends.map((e, i) => i === curEnd ? e.slice(0, -1) : e));
  }

  function tapTarget(x, y) {
    if (curEndSpan.length >= ARROWS_PER_END) return;
    const score = xyToScore(x, y);
    const newSpan = spanData.map((s, i) => i === curEnd ? [...s, { x, y, score }] : s);
    const newEnds = ends.map((e, i) => i === curEnd ? [...e, score] : e);
    setSpanData(newSpan);
    setEnds(newEnds);
    if (curEndSpan.length + 1 >= ARROWS_PER_END) {
      setTimeout(() => advanceEnd(newEnds, newSpan), 260);
    }
  }

  function undoSpan() {
    if (!curEndSpan.length) return;
    setSpanData(spanData.map((s, i) => i === curEnd ? s.slice(0, -1) : s));
    setEnds(ends.map((e, i) => i === curEnd ? e.slice(0, -1) : e));
  }

  const arrowCount = isSpan ? curEndSpan.length : curEndArrows.length;

  // Progress bar
  const ProgressBar = () => {
    if (!isW) {
      return (
        <View style={styles.progressRow}>
          {Array.from({ length: endsCount }).map((_, i) => (
            <View key={i} style={[styles.progressDot, i < curEnd && styles.dotDone, i === curEnd && styles.dotCurrent]} />
          ))}
        </View>
      );
    }
    return (
      <View style={styles.progressWrap}>
        {[0, 1].map(round => (
          <View key={round}>
            <Text style={styles.roundLabel}>{round === 0 ? "R1" : "R2"}</Text>
            <View style={styles.progressRow}>
              {Array.from({ length: 6 }).map((_, i) => {
                const idx = round * 6 + i;
                return <View key={i} style={[styles.progressDot, idx < curEnd && styles.dotDone, idx === curEnd && styles.dotCurrent]} />;
              })}
            </View>
            {round === 0 && r1Total !== null && (
              <Text style={styles.r1Subtotal}>R1: {r1Total}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onHome} >
          <Text style={styles.backBtn}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.topDist}>{distance}</Text>
        <Text style={styles.topMeta}>
          {isSpan ? "🎯 Span" : "Score"}
          {isW ? `  ·  Round ${roundNum}` : ""}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" scrollEnabled={!isPressingTarget}>
        <ProgressBar />

        {/* End label */}
        <Text style={styles.endLabel}>
          {isW ? `Round ${roundNum}, End ${endInRound}` : `End ${curEnd + 1} of ${endsCount}`}
        </Text>

        {/* Running total */}
        <Text style={styles.runningTotal}>{runningTotal}</Text>

        {/* Arrow slots */}
        <View style={styles.slots}>
          {Array.from({ length: ARROWS_PER_END }).map((_, i) => {
            const a = curEndArrows[i];
            if (a !== undefined) {
              const z = ZONE[a];
              const bordered = a === 1 || a === 2;
              return (
                <View key={i} style={[styles.slot, styles.slotFilled, { backgroundColor: z.bg }, bordered && styles.slotBordered]}>
                  <Text style={[styles.slotText, { color: z.text }]}>{String(a)}</Text>
                </View>
              );
            }
            return (
              <View key={i} style={[styles.slot, i < arrowCount ? styles.slotPending : styles.slotEmpty]}>
                <Text style={styles.slotNum}>{i + 1}</Text>
              </View>
            );
          })}
        </View>

        {/* Span target */}
        {isSpan && (
          <SpanTarget
            arrows={curEndSpan}
            onPlace={tapTarget}
            onUndo={undoSpan}
            maxArrows={ARROWS_PER_END}
            onPressIn={() => setIsPressingTarget(true)}
            onPressOut={() => setIsPressingTarget(false)}
          />
        )}

        {/* Score buttons */}
        {!isSpan && (
          <View>
            <View style={styles.scoreGrid}>
              {SCORE_BUTTONS.map(s => {
                const z = ZONE[s];
                const bordered = s === 1 || s === 2;
                return (
                  <TouchableOpacity
                    key={String(s)}
                    onPress={() => addScore(s)}
                    activeOpacity={0.75}
                    style={[styles.scoreBtn, { backgroundColor: z.bg }, bordered && styles.scoreBtnBordered]}
                  >
                    <View style={styles.scoreBtnInner}>
                      <Text style={[styles.scoreBtnText, { color: z.text }]}>{String(s)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={undoScore} style={styles.undoBtn}>
              <Text style={styles.undoBtnText}>⟵ Undo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Previous ends summary */}
        {curEnd > 0 && (
          <View style={styles.prevEnds}>
            <Text style={styles.prevLabel}>Previous ends</Text>
            {ends.slice(0, curEnd).map((end, i) => {
              if (!end.length) return null;
              const et = end.reduce((s, a) => s + sv(a), 0);
              const showR1div = isW && i === 6;
              return (
                <View key={i}>
                  {showR1div && (
                    <View style={styles.prevR1div}>
                      <Text style={styles.prevR1text}>Round 1 total: {r1Total}</Text>
                    </View>
                  )}
                  <View style={styles.prevRow}>
                    <Text style={styles.prevEndName}>
                      {isW ? `R${Math.floor(i / 6) + 1}·${(i % 6) + 1}` : `E${i + 1}`}
                    </Text>
                    <View style={styles.prevChips}>
                      {end.map((a, j) => {
                        const z = ZONE[a];
                        return (
                          <View key={j} style={[styles.prevChip, { backgroundColor: z.bg }, (a === 1 || a === 2) && styles.prevChipBordered]}>
                            <Text style={[styles.prevChipText, { color: z.text }]}>{String(a)}</Text>
                          </View>
                        );
                      })}
                    </View>
                    <Text style={styles.prevEt}>{et}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { paddingTop: 56, paddingHorizontal: 18, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { fontSize: 14, color: COLORS.muted },
  topDist: { fontSize: 18, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },
  topMeta: { fontSize: 12, color: COLORS.muted },
  content: { paddingHorizontal: 18, paddingTop: 8 },

  progressWrap: { gap: 6, marginBottom: 12 },
  progressRow: { flexDirection: "row", gap: 5, marginVertical: 2 },
  progressDot: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "#e0e0e0" },
  dotDone: { backgroundColor: COLORS.accent },
  dotCurrent: { backgroundColor: COLORS.accent, opacity: 0.4 },
  roundLabel: { fontSize: 10, color: COLORS.muted, marginBottom: 2 },
  r1Subtotal: { fontSize: 11, color: COLORS.accent, fontWeight: "600", marginTop: 3 },

  endLabel: { fontSize: 13, color: COLORS.muted, fontWeight: "500", marginBottom: 2, textAlign: "center" },
  runningTotal: { fontSize: 52, fontWeight: "900", color: COLORS.text, letterSpacing: -3, textAlign: "center", lineHeight: 58 },

  slots: { flexDirection: "row", gap: 8, marginVertical: 16, justifyContent: "center" },
  slot: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  slotFilled: {},
  slotBordered: { borderWidth: 1, borderColor: "#ddd" },
  slotPending: { backgroundColor: "#e8edff" },
  slotEmpty: { backgroundColor: "#f0f0f0" },
  slotText: { fontSize: 15, fontWeight: "800" },
  slotNum: { fontSize: 12, color: "#ccc", fontWeight: "600" },

  targetWrap: { alignItems: "center", gap: 12 },

  scoreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" },
  scoreBtn: { width: "13.5%", aspectRatio: 1, borderRadius: 12 },
  scoreBtnBordered: { borderWidth: 1.5, borderColor: "#ddd" },
  scoreBtnInner: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center" },
  scoreBtnText: { fontSize: 17, fontWeight: "800", lineHeight: 22 },

  undoBtn: { marginTop: 10, alignItems: "center", paddingVertical: 10 },
  undoBtnText: { fontSize: 14, color: COLORS.muted, fontWeight: "600" },

  prevEnds: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#efefef" },
  prevLabel: { fontSize: 11, color: COLORS.muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  prevRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  prevEndName: { width: 36, fontSize: 11, color: COLORS.muted, fontWeight: "600" },
  prevChips: { flex: 1, flexDirection: "row", gap: 4 },
  prevChip: { width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  prevChipBordered: { borderWidth: 1, borderColor: "#ddd" },
  prevChipText: { fontSize: 10, fontWeight: "800" },
  prevEt: { width: 28, textAlign: "right", fontSize: 12, fontWeight: "700", color: COLORS.text },
  prevR1div: { paddingVertical: 5, marginVertical: 4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#e8eeff", backgroundColor: "#f5f7ff" },
  prevR1text: { fontSize: 11, color: COLORS.accent, fontWeight: "700", textAlign: "center" },
});
