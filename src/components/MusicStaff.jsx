import { useEffect, useRef, useState } from "react";
import { Renderer, Stave, Voice, Formatter, StaveNote, Dot } from "vexflow";
import { generateMeasure } from "../music/generator";

function parseTimeSignature(ts) {
  const [top, bottom] = ts.split("/").map(Number);
  return { beats: Math.max(1, top), beatValue: bottom || 4 };
}

function playClick(isDownbeat) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(isDownbeat ? 1000 : 600, ctx.currentTime);

  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export default function MusicStaff({ settings }) {
  const containerRef = useRef();
  const playheadRef = useRef();

  const TOTAL_MEASURES = 12;
  const PER_LINE = 4;
  const MEASURE_WIDTH = 230;
  const SYSTEM_HEIGHT = 130;
  const START_X = 40;
  const START_Y = 20;

  const { beats, beatValue } = parseTimeSignature(settings.timeSignature);

  const [measures, setMeasures] = useState(() => {
    const initialBeats = Math.max(
      1,
      Number(settings.timeSignature.split("/")[0]),
    );
    const initialBeatValue = Number(settings.timeSignature.split("/")[1]) || 4;
    return Array.from(
      { length: 12 },
      () =>
        generateMeasure(
          initialBeats,
          initialBeatValue,
          settings.isChordMode,
          settings.keySignature,
        ), // Added parameter
    );
  });
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);

  // 1. Render VexFlow Layout
  useEffect(() => {
    if (!containerRef.current || measures.length === 0) return;

    containerRef.current.innerHTML = "";
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    const ctx = renderer.getContext();

    renderer.resize(1000, 450);

    measures.forEach((measureNotes, i) => {
      const row = Math.floor(i / PER_LINE);
      const col = i % PER_LINE;

      const x = START_X + col * MEASURE_WIDTH;
      const y = START_Y + row * SYSTEM_HEIGHT;

      const stave = new Stave(x, y, MEASURE_WIDTH);

      if (col === 0) {
        stave.addClef("treble");
        stave.addTimeSignature(settings.timeSignature);
        stave.addKeySignature(settings.keySignature);
      }

      stave.setContext(ctx).draw();

      const voice = new Voice({ num_beats: beats, beat_value: beatValue });
      voice.setStrict(false);

      const nativeStaveNotes = measureNotes.map((noteData) => {
        const staveNote = new StaveNote({
          clef: noteData.clef,
          keys: noteData.keys,
          duration: noteData.duration,
        });

        if (noteData.hasDot) {
          staveNote.addModifier(new Dot(), 0);
        }

        return staveNote;
      });

      voice.addTickables(nativeStaveNotes);

      const startPadding = col === 0 ? 50 : 15;
      const endPadding = 15;
      const formattingWidth = MEASURE_WIDTH - (startPadding + endPadding);
      const formatter = new Formatter();
      formatter.joinVoices([voice]);
      formatter.formatToStave([voice], stave, { align_rests: true });

      voice.draw(ctx, stave);
    });
  }, [measures, beats, beatValue, settings.timeSignature]);

  // 2. Playhead Frame & Audio Timer Loop
  useEffect(() => {
    if (!settings.isPlaying) {
      if (playheadRef.current) {
        playheadRef.current.style.transform = `translate(${START_X}px, ${START_Y}px)`;
      }
      return;
    }

    let animationFrameId;
    let startTime = performance.now();
    let lastTriggeredBeat = -1;

    const beatsPerSecond = settings.tempo / 60;
    const secondsPerMeasure = (beats / beatsPerSecond) * (4 / beatValue);
    const msPerMeasure = secondsPerMeasure * 1000;
    const msPerBeat = msPerMeasure / beats;

    const tick = () => {
      const now = performance.now();
      let elapsed = now - startTime;

      // Handle measure overflow cleanly
      if (elapsed >= msPerMeasure) {
        startTime = now; // Reset clock anchor for the brand new measure
        elapsed = 0;
        lastTriggeredBeat = -1; // Reset beat click index tracker

        // Safely advance the index context array pointer
        setCurrentMeasureIndex((prevIndex) => {
          if (prevIndex >= TOTAL_MEASURES - 1) {
            // Generate a fresh tracking canvas if we hit the end of the sheet
            const fullSheet = Array.from({ length: TOTAL_MEASURES }, () =>
              generateMeasure(
                beats,
                beatValue,
                settings.isChordMode,
                settings.keySignature,
              ),
            );
            setMeasures(fullSheet);
            return 0; // Wrap back around to measure 1
          }
          return prevIndex + 1; // Step up to the next bar
        });
      }

      // Calculate progress layout vectors
      const measureProgress = Math.min(elapsed / msPerMeasure, 1);
      const row = Math.floor(currentMeasureIndex / PER_LINE);
      const col = currentMeasureIndex % PER_LINE;

      const measureStartX = START_X + col * MEASURE_WIDTH;
      const playheadX = measureStartX + measureProgress * MEASURE_WIDTH;
      const playheadY = START_Y + row * SYSTEM_HEIGHT;

      // Render red tracking line ONLY if reading mode is off
      if (!settings.isReadingMode && playheadRef.current) {
        playheadRef.current.style.transform = `translate(${playheadX}px, ${playheadY}px)`;
      }

      // Track sub-beat intervals and execute click sounds
      const currentBeat = Math.floor(elapsed / msPerBeat);
      if (
        currentBeat !== lastTriggeredBeat &&
        currentBeat >= 0 &&
        currentBeat < beats
      ) {
        playClick(currentBeat === 0);
        lastTriggeredBeat = currentBeat;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    currentMeasureIndex, // Keeps loop aligned with active line state steps
    settings.tempo,
    settings.isPlaying,
    settings.isReadingMode,
    settings.isChordMode,
    settings.keySignature,
    beats,
    beatValue,
  ]);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "980px",
        background: "#f9f9f9",
        border: "1px solid #ccc",
        borderRadius: "4px",
        margin: "0 auto",
      }}
    >
      <div
        ref={playheadRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "2px",
          // FIXED: Adjusted to 50px to match the precise height of a VexFlow Stave
          height: "50px",
          backgroundColor: "red",
          zIndex: 10,
          transition: "transform 0.016s linear",
          pointerEvents: "none",
          // FIXED: Hide playhead line if static reading mode is on
          display: settings.isReadingMode ? "none" : "block",
        }}
      />
      <div ref={containerRef} />
    </div>
  );
}
