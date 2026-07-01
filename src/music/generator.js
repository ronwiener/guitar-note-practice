// src/music/generator.js

const OPEN_POSITION_SCALE = [
  "e/3",
  "f/3",
  "g/3", // 6th String
  "a/3",
  "b/3",
  "c/4", // 5th String
  "d/4",
  "e/4",
  "f/4", // 4th String
  "g/4",
  "a/4", // 3rd String
  "b/4",
  "c/5",
  "d/5", // 2nd String
  "e/5",
  "f/5",
  "g/5", // 1st String
];

// src/music/generator.js

// Add this back to the top of the file:
const BASE_OPEN_SCALE = [
  "e/3",
  "f/3",
  "g/3",
  "a/3",
  "b/3",
  "c/4",
  "d/4",
  "e/4",
  "f/4",
  "g/4",
  "a/4",
  "b/4",
  "c/5",
  "d/5",
  "e/5",
  "f/5",
  "g/5",
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// src/music/generator.js

function getKeySignatureScale(key) {
  return BASE_OPEN_SCALE.map((note) => {
    let modifiedNote = note;

    // --- SHARP KEYS (Cumulative Rules) ---

    // G, D, A, and E Major all share an F#
    if (["G", "D", "A", "E"].includes(key) && modifiedNote.startsWith("f/")) {
      modifiedNote = modifiedNote.replace("f/", "f#/");
    }

    // D, A, and E Major also share a C#
    if (["D", "A", "E"].includes(key) && modifiedNote.startsWith("c/")) {
      modifiedNote = modifiedNote.replace("c/", "c#/");
    }

    // A and E Major also share a G#
    if (["A", "E"].includes(key) && modifiedNote.startsWith("g/")) {
      modifiedNote = modifiedNote.replace("g/", "g#/");
    }

    // E Major also includes a D#
    if (key === "E" && modifiedNote.startsWith("d/")) {
      modifiedNote = modifiedNote.replace("d/", "d#/");
    }

    // --- FLAT KEYS ---

    // F Major includes a Bb
    if (key === "F" && modifiedNote.startsWith("b/")) {
      modifiedNote = modifiedNote.replace("b/", "bb/");
    }

    // --- FLAT KEYS (Cumulative Rules) ---

    // F, Bb, Eb, Ab, and Db Major all share a Bb
    if (
      ["F", "Bb", "Eb", "Ab", "Db"].includes(key) &&
      modifiedNote.startsWith("b/")
    ) {
      modifiedNote = modifiedNote.replace("b/", "bb/");
    }

    // Bb, Eb, Ab, and Db Major also share an Eb
    if (
      ["Bb", "Eb", "Ab", "Db"].includes(key) &&
      modifiedNote.startsWith("e/")
    ) {
      modifiedNote = modifiedNote.replace("e/", "eb/");
    }

    // Eb, Ab, and Db Major also share an Ab
    if (["Eb", "Ab", "Db"].includes(key) && modifiedNote.startsWith("a/")) {
      modifiedNote = modifiedNote.replace("a/", "ab/");
    }

    // Ab and Db Major also share a Db
    if (["Ab", "Db"].includes(key) && modifiedNote.startsWith("d/")) {
      modifiedNote = modifiedNote.replace("d/", "db/");
    }

    // Db Major also includes a Gb
    if (key === "Db" && modifiedNote.startsWith("g/")) {
      modifiedNote = modifiedNote.replace("g/", "gb/");
    }

    return modifiedNote;
  });
}

function getNextMusicalNote(currentIndex) {
  const steps = [-2, -1, 0, 1, 2];
  let newIndex = currentIndex + rand(steps);
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= OPEN_POSITION_SCALE.length)
    newIndex = OPEN_POSITION_SCALE.length - 1;
  return newIndex;
}

// Generates a mixture of 2, 3, or 4 note groupings that align harmonically
function generateDynamicChord(baseIndex) {
  // Roll a dice to decide the texture: 2-note interval, 3-note chord, or 4-note chord
  const chordType = rand(["dyad", "triad", "quad"]);
  const chordKeys = [];

  let size = 2;
  if (chordType === "triad") size = 3;
  if (chordType === "quad") size = 4;

  for (let i = 0; i < size; i++) {
    // Skip intervals by thirds (i * 2) to build rich open-position chords
    const noteIndex = baseIndex + i * 2;
    if (noteIndex < OPEN_POSITION_SCALE.length) {
      chordKeys.push(OPEN_POSITION_SCALE[noteIndex]);
    }
  }

  return chordKeys.length > 0 ? chordKeys : [OPEN_POSITION_SCALE[baseIndex]];
}

// src/music/generator.js

export function generateMeasure(
  beats,
  beatValue = 4,
  isChordMode = false,
  keySignature = "C",
  complexRhythms = false,
) {
  const notes = [];
  let remainingTicks = beats * (4096 / beatValue);

  const currentScalePool = getKeySignatureScale(keySignature);
  let currentNoteIndex = Math.floor(Math.random() * currentScalePool.length);

  // 1. Establish duration option trees based on whether user wants complex rhythms
  let noteOptions = [];
  if (complexRhythms) {
    // FIXED: Weighted pool. Notes appear frequently, rests appear rarely.
    noteOptions = [
      { ticks: 2048, duration: "h", isRest: false }, // Half Note
      { ticks: 1024, duration: "q", isRest: false }, // Quarter Note
      { ticks: 1024, duration: "q", isRest: false }, // (Repeat to increase odds)
      { ticks: 1024, duration: "q", isRest: false }, // (Repeat to increase odds)
      { ticks: 512, duration: "8", isRest: false }, // Eighth Note
      { ticks: 512, duration: "8", isRest: false }, // (Repeat to increase odds)

      // Rests are restricted to just one entry each, making them rare wildcards
      { ticks: 1024, duration: "qr", isRest: true }, // Rare Quarter Rest
      { ticks: 512, duration: "8r", isRest: true }, // Rare Eighth Rest
    ];
  } else {
    // Standard baseline patterns (No complex subdivisions or pauses)
    noteOptions = [
      { ticks: 2048, duration: "h", isRest: false },
      { ticks: 1024, duration: "q", isRest: false },
    ];
  }

  const fallbackNote = { ticks: 1024, duration: "q", isRest: false };

  // 2. Generation Loop
  while (remainingTicks > 0) {
    const validOptions = noteOptions.filter((o) => o.ticks <= remainingTicks);
    if (validOptions.length === 0) {
      // Emergency patch for trailing tiny spaces
      remainingTicks = 0;
      break;
    }

    const choice = rand(validOptions);
    let finalKeys = [];

    if (choice.isRest) {
      // VexFlow draws a rest on the middle line ("b/4") when duration has an "r" modifier suffix
      finalKeys = ["b/4"];
    } else {
      currentNoteIndex = getNextMusicalNote(
        currentNoteIndex,
        currentScalePool.length,
      );

      if (isChordMode) {
        // Only bundle chords on Quarters or Halves; isolated eighth-note chords are rare in standard sight reading
        if (choice.ticks >= 1024 && Math.random() > 0.4) {
          finalKeys = generateDynamicChord(currentNoteIndex, currentScalePool);
        } else {
          finalKeys = [currentScalePool[currentNoteIndex]];
        }
      } else {
        finalKeys = [currentScalePool[currentNoteIndex]];
      }
    }

    notes.push({
      clef: "treble",
      keys: finalKeys,
      duration: choice.duration,
    });

    remainingTicks -= choice.ticks;
  }

  return notes;
}
