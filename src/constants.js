export const ARROWS_PER_END = 6;
export const SCORE_BUTTONS = ["X", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, "M"];

export const ZONE = {
  X:  { bg: "#FFD500", text: "#1a1a1a" },
  10: { bg: "#FFD500", text: "#1a1a1a" },
  9:  { bg: "#FFE033", text: "#1a1a1a" },
  8:  { bg: "#E8132A", text: "#fff"    },
  7:  { bg: "#f0374d", text: "#fff"    },
  6:  { bg: "#1A7AE8", text: "#fff"    },
  5:  { bg: "#4a9af0", text: "#fff"    },
  4:  { bg: "#1a1a1a", text: "#fff"    },
  3:  { bg: "#3a3a3a", text: "#fff"    },
  2:  { bg: "#f0f0f0", text: "#1a1a1a" },
  1:  { bg: "#ffffff", text: "#1a1a1a" },
  M:  { bg: "#ececec", text: "#999"    },
};

export const TARGET_RINGS = [
  { r: 1.00, fill: "#f5f5f5", stroke: "#ccc"    },
  { r: 0.90, fill: "#f0f0f0", stroke: "#ccc"    },
  { r: 0.80, fill: "#1a1a1a", stroke: "#333"    },
  { r: 0.70, fill: "#222",    stroke: "#333"    },
  { r: 0.60, fill: "#1A7AE8", stroke: "#1565C0" },
  { r: 0.50, fill: "#3d8ef0", stroke: "#1565C0" },
  { r: 0.40, fill: "#E8132A", stroke: "#b71c1c" },
  { r: 0.30, fill: "#f0374d", stroke: "#b71c1c" },
  { r: 0.20, fill: "#FFD500", stroke: "#e6c000" },
  { r: 0.10, fill: "#FFE033", stroke: "#e6c000" },
  { r: 0.04, fill: "#fff",    stroke: "#e6c000" },
];

export const ZONE_RADII = [
  { max: 0.04, score: "X" }, { max: 0.10, score: 10 },
  { max: 0.20, score: 9  }, { max: 0.30, score: 8  },
  { max: 0.40, score: 7  }, { max: 0.50, score: 6  },
  { max: 0.60, score: 5  }, { max: 0.70, score: 4  },
  { max: 0.80, score: 3  }, { max: 0.90, score: 2  },
  { max: 1.00, score: 1  }, { max: Infinity, score: "M" },
];

export const DIST_6 = [
  { label: "30m",    sub: "Short outdoor" },
  { label: "50m",    sub: "Medium"        },
  { label: "70m",    sub: "Olympic"       },
  { label: "Custom", sub: "Any distance"  },
];

export const DIST_12 = [
  { label: "30W", sub: "Short W"       },
  { label: "50W", sub: "Medium W"      },
  { label: "SH",  sub: "Short Half" },
  { label: "70W", sub: "Olympic W"     },
];

export const W_ROUNDS = {
  "18W": ["18m", "18m"],
  "30W": ["30m", "30m"],
  "SH":  ["50m", "30m"],
  "50W": ["50m", "50m"],
  "70W": ["70m", "70m"],
};

export const COLORS = {
  accent:  "#4f7ef7",
  bg:      "#f7f7f7",
  card:    "#ffffff",
  text:    "#1a1a1a",
  sub:     "#888888",
  muted:   "#bbbbbb",
  faint:   "#eeeeee",
  border:  "#efefef",
  accentBg:"#f0f5ff",
};
