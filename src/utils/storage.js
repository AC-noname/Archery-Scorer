import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_KEY = "archery_sessions_v1";
const LOCATION_KEY = "archery_location_v1";

export async function loadSessions() {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions) {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

export async function loadLocation() {
  try {
    return (await AsyncStorage.getItem(LOCATION_KEY)) || "";
  } catch {
    return "";
  }
}

export async function saveLocation(loc) {
  try {
    await AsyncStorage.setItem(LOCATION_KEY, loc);
  } catch {}
}
