// src/components/Toolbar.jsx
export default function ToolBar({ settings, setSettings, onNewSheet }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // FIXED: Centers groups and eliminates the big middle gap
        gap: "24px", // Even spacing between all inner tool blocks
        flexWrap: "wrap",
        padding: "12px 20px",
        marginBottom: "24px",
        background: "var(--bg, #ffffff)",
        border: "1px solid var(--border, #cbd5e1)",
        borderRadius: "8px",
        boxShadow: "var(--shadow)",
        maxWidth: "980px",
        margin: "0 auto 24px auto",
        boxSizing: "border-box",
      }}
    >
      {/* Left Section: Controls Group */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Play Button */}
        <button
          onClick={() =>
            setSettings((s) => ({ ...s, isPlaying: !s.isPlaying }))
          }
          style={{
            padding: "8px 16px",
            backgroundColor: settings.isPlaying
              ? "#ef4444"
              : "var(--accent, #2563eb)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>{settings.isPlaying ? "⏹" : "▶"}</span>
          {settings.isPlaying ? "Stop" : "Play"}
        </button>

        {/* New Sheet Button */}
        <button
          onClick={onNewSheet}
          style={{
            padding: "8px 14px",
            backgroundColor: "transparent",
            color: "var(--text-h)",
            border: "1px solid var(--border, #cbd5e1)",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>🔄</span> New Sheet
        </button>

        {/* Tempo Control */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--text-h)",
          }}
        >
          <span>BPM:</span>
          <input
            type="range"
            min="40"
            max="200"
            value={settings.tempo}
            disabled={settings.isReadingMode}
            onChange={(e) =>
              setSettings((s) => ({ ...s, tempo: Number(e.target.value) }))
            }
            style={{
              accentColor: "var(--accent, #2563eb)",
              cursor: settings.isReadingMode ? "not-allowed" : "pointer",
              width: "100px",
              opacity: settings.isReadingMode ? 0.5 : 1,
            }}
          />
          <span
            style={{
              fontSize: "13px",
              background: "var(--code-bg, #f1f5f9)",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            {settings.tempo}
          </span>
        </label>
      </div>

      {/* Right Section: Selectors & Toggles Group */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Reading Mode Toggle */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "500",
            color: "var(--text-h)",
            fontSize: "13px",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "6px",
            backgroundColor: "var(--code-bg, #f1f5f9)",
          }}
        >
          <input
            type="checkbox"
            checked={settings.isReadingMode}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                isReadingMode: e.target.checked,
                isPlaying: e.target.checked ? false : s.isPlaying,
              }))
            }
            style={{
              accentColor: "var(--accent, #2563eb)",
              width: "14px",
              height: "14px",
              cursor: "pointer",
            }}
          />
          <span>Reading</span>
        </label>

        {/* Chord Mode Toggle */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "500",
            color: "var(--text-h)",
            fontSize: "13px",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "6px",
            backgroundColor: "var(--code-bg, #f1f5f9)",
          }}
        >
          <input
            type="checkbox"
            checked={settings.isChordMode}
            onChange={(e) =>
              setSettings((s) => ({ ...s, isChordMode: e.target.checked }))
            }
            style={{
              accentColor: "var(--accent, #2563eb)",
              width: "14px",
              height: "14px",
              cursor: "pointer",
            }}
          />
          <span>Chords</span>
        </label>

        {/* Complex Rhythms Toggle */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "500",
            color: "var(--text-h)",
            fontSize: "13px",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "6px",
            backgroundColor: "var(--code-bg, #f1f5f9)",
          }}
        >
          <input
            type="checkbox"
            checked={settings.complexRhythms}
            onChange={(e) =>
              setSettings((s) => ({ ...s, complexRhythms: e.target.checked }))
            }
            style={{
              accentColor: "var(--accent, #2563eb)",
              width: "14px",
              height: "14px",
              cursor: "pointer",
            }}
          />
          <span>Rhythms (8ths/Rests)</span>
        </label>

        {/* Key Signature Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
          }}
        >
          <span style={{ fontWeight: "500", color: "var(--text-h)" }}>
            Key:
          </span>
          <select
            value={settings.keySignature}
            onChange={(e) =>
              setSettings((s) => ({ ...s, keySignature: e.target.value }))
            }
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border, #cbd5e1)",
              background: "var(--bg, #ffffff)",
              color: "var(--text-h)",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            <option value="C">C Maj</option>
            <option value="G">G Maj</option>
            <option value="D">D Maj</option>
            <option value="A">A Maj</option>
            <option value="E">E Maj</option>
            <option value="F">F Maj</option>
            <option value="Bb">Bb Maj</option>
            <option value="Eb">Eb Maj</option>
            <option value="Ab">Ab Maj</option>
            <option value="Db">Db Maj</option>
          </select>
        </div>

        {/* Time Signature Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
          }}
        >
          <span style={{ fontWeight: "500", color: "var(--text-h)" }}>
            Time:
          </span>
          <select
            value={settings.timeSignature}
            onChange={(e) =>
              setSettings((s) => ({ ...s, timeSignature: e.target.value }))
            }
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border, #cbd5e1)",
              background: "var(--bg, #ffffff)",
              color: "var(--text-h)",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            <option>2/4</option>
            <option>3/4</option>
            <option>4/4</option>
            <option>6/8</option>
          </select>
        </div>
      </div>
    </div>
  );
}
