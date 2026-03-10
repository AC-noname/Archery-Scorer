import { ZONE_RADII } from "../constants";

export const sv = s => s === "X" ? 10 : s === "M" ? 0 : Number(s);

export const xyToScore = (x, y) =>
  ZONE_RADII.find(z => Math.sqrt(x * x + y * y) <= z.max)?.score ?? "M";

export const countTens = arr => arr.filter(a => a === 10 || a === "X").length;
export const countX    = arr => arr.filter(a => a === "X").length;

export const formatDate = (date) =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const formatTime = (date) =>
  date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
