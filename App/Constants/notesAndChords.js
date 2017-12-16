export const NOTES = [
    'C',
    'C♯/D♭',
    'D',
    'D♯/E♭',
    'E',
    'F',
    'F♯/G♭',
    'G',
    'G♯/A♭',
    'A',
    'A♯/B♭',
    'B',
];
export const NOTES_TO_INDEX = NOTES.reduce((map, note, index) => {
    map[note] = index;
    return map;
}, {});
export const NUM_POINTS = Object.keys(NOTES_TO_INDEX).length;
export const DIATONIC_CHORDS = [
    {
        label: 'C Major 7th Chord',
        notes: ['B', 'C', 'E', 'G'],
        shapeType: 0,
    },
    {
        label: 'D Minor 7th Chord',
        notes: ['B', 'D', 'E', 'G'],
        shapeType: 1,
    },
    {
        label: 'E Minor 7th Chord',
        notes: ['B', 'D', 'F', 'G'],
        shapeType: 2,
    },
    {
        label: 'F Major 7th Chord',
        notes: ['C', 'D', 'F', 'A'],
        shapeType: 1,
    },
    {
        label: 'G Dominant 7th Chord',
        notes: ['C', 'E', 'F', 'A'],
        shapeType: 0,
    },
    {
        label: 'A Minor 7th Chord',
        notes: ['C', 'E', 'G', 'A'],
        shapeType: 1,
    },
    {
        label: 'B Half Diminished Chord',
        notes: ['B', 'D', 'F', 'A'],
        shapeType: 2,
    },
];
export const NUM_CHORDS = DIATONIC_CHORDS.length;
