// src/App.jsx
import { useState } from "react";
import ToolBar from "./components/ToolBar";
import MusicStaff from "./components/MusicStaff";

export default function App() {
  const [settings, setSettings] = useState({
    tempo: 60,
    timeSignature: "4/4",
    isPlaying: false,
    isReadingMode: false,
    isChordMode: false,
    keySignature: "C",
    complexRhythms: "false",
  });

  // Create a simple incrementing counter to act as a refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewSheet = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div style={{ padding: 20 }}>
      <ToolBar
        settings={settings}
        setSettings={setSettings}
        onNewSheet={handleNewSheet}
      />

      <MusicStaff
        key={`${settings.timeSignature}-${settings.isChordMode}-${settings.keySignature}-${settings.complexRhythms}-${refreshKey}`}
        settings={settings}
      />
    </div>
  );
}
