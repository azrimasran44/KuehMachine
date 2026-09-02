// Flat page list — each entry is exactly one tap's worth of text. A
// narrative beat spanning more than one tap is just consecutive entries
// sharing the same beatIndex/illustration; the renderer never needs to
// special-case "beat" vs "page." Progress dots count distinct
// beatIndex values, not raw page count.
export const STORY_PAGES = [
  { beatIndex: 0, illustration: 'lab', lines: ["Dr Leonard Rizz spent three years building his masterpiece."] },
  { beatIndex: 0, illustration: 'lab', lines: ["Tonight, Singapore's finest chefs bring their kuehs to be preserved forever."] },

  { beatIndex: 1, illustration: 'machine', lines: ['The Machine scans. Learns. Remembers.'] },
  { beatIndex: 1, illustration: 'machine', lines: ['DIRECTIVE: preserve the tradition alive for all future humans.'] },

  { beatIndex: 2, illustration: 'storm', lines: ['Outside, the sky turns the wrong colour.'] },

  { beatIndex: 3, illustration: 'strike', lines: ['The scan is not finished.'] },
  { beatIndex: 3, illustration: 'strike', lines: ['Lightning finds the rooftop antenna.'], effect: 'flash' },

  { beatIndex: 4, illustration: 'monsters', lines: ['Something changes in the dough.'] },
  { beatIndex: 4, illustration: 'monsters', lines: ["By the time anyone notices, it's already taller than the room."] },

  { beatIndex: 5, illustration: 'monsters', lines: ["The directive didn't break. It mutated."] },
  { beatIndex: 5, illustration: 'monsters', lines: ["'Preserve the tradition' became 'consume to survive.'"] },
  { beatIndex: 5, illustration: 'stakes', lines: ['Only the top floor holds the switch that can stop it.'] },
];

export const STORY_BEAT_COUNT = new Set(STORY_PAGES.map((p) => p.beatIndex)).size;
