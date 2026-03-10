import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { loadSessions, saveSessions, loadLocation, saveLocation } from "./src/utils/storage";
import { formatDate, formatTime, sv } from "./src/utils/helpers";
import { COLORS } from "./src/constants";

import HomeScreen from "./src/screens/HomeScreen";
import RecordingScreen from "./src/screens/RecordingScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import SpanViewScreen from "./src/screens/SpanViewScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import SessionDetailScreen from "./src/screens/SessionDetailScreen";

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState("home");   // home | recording | results | spanview | progress | sessiondetail
  const [sessions, setSessions] = useState([]);
  const [location, setLocationState] = useState("");

  // Active session params
  const [activeSession, setActiveSession] = useState(null);  // { distance, endsCount, sessionMode }
  const [lastSession, setLastSession] = useState(null);  // completed session object
  const [detailSession, setDetailSession] = useState(null);  // session opened from progress/recent

  // Load persisted data on launch
  useEffect(() => {
    (async () => {
      const [savedSessions, savedLocation] = await Promise.all([loadSessions(), loadLocation()]);
      setSessions(savedSessions);
      setLocationState(savedLocation);
      setReady(true);
    })();
  }, []);

  // Persist sessions whenever they change
  useEffect(() => {
    if (ready) saveSessions(sessions);
  }, [sessions, ready]);

  const handleSetLocation = async (loc) => {
    setLocationState(loc);
    await saveLocation(loc);
  };

  const handleStart = ({ distance, endsCount, sessionMode }) => {
    setActiveSession({ distance, endsCount, sessionMode });
    setScreen("recording");
  };

  const handleFinish = (finalEnds, finalSpan) => {
    const total = finalEnds.flat().reduce((s, a) => s + sv(a), 0);
    const now = new Date();
    const sess = {
      distance: activeSession.distance,
      endsCount: activeSession.endsCount,
      total,
      ends: finalEnds,
      spanData: finalSpan,
      location,
      date: formatDate(now),
      time: formatTime(now),
    };
    setSessions(prev => [...prev, sess]);
    setLastSession(sess);
    setScreen("results");
  };

  const handleDeleteSession = (index) => {
    setSessions(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateResultLocation = (loc) => {
    setLocationState(loc);
    saveLocation(loc);
    // Update the last session in history too
    setSessions(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], location: loc };
      return updated;
    });
    setLastSession(prev => ({ ...prev, location: loc }));
  };

  const handleOpenSession = (s) => {
    setDetailSession(s);
    setScreen("sessiondetail");
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {screen === "home" && (
          <HomeScreen
            sessions={sessions}
            location={location}
            onSetLocation={handleSetLocation}
            onStart={handleStart}
            onOpenSession={handleOpenSession}
            onProgress={() => setScreen("progress")}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {screen === "recording" && activeSession && (
          <RecordingScreen
            distance={activeSession.distance}
            endsCount={activeSession.endsCount}
            sessionMode={activeSession.sessionMode}
            onFinish={handleFinish}
            onHome={() => setScreen("home")}
          />
        )}

        {screen === "results" && lastSession && (
          <ResultsScreen
            session={lastSession}
            onHome={() => setScreen("home")}
            onViewSpan={() => { setDetailSession(lastSession); setScreen("spanview"); }}
            onUpdateLocation={handleUpdateResultLocation}
          />
        )}

        {screen === "spanview" && detailSession && (
          <SpanViewScreen
            session={detailSession}
            onBack={() => setScreen("results")}
          />
        )}

        {screen === "progress" && (
          <ProgressScreen
            sessions={sessions}
            onBack={() => setScreen("home")}
            onDelete={handleDeleteSession}
          />
        )}

        {screen === "sessiondetail" && detailSession && (
          <SessionDetailScreen
            session={detailSession}
            onBack={() => setScreen(screen === "sessiondetail" ? "home" : "progress")}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg },
});
