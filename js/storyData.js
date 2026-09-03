// Flat page list — each entry is exactly one tap's worth of text. A
// narrative beat spanning more than one tap is just consecutive entries
// sharing the same beatIndex/illustration; the renderer never needs to
// special-case "beat" vs "page." Progress dots count distinct
// beatIndex values, not raw page count.
//
// Each beat now has one dedicated full-span reference image (beat1.png
// through beat6.png, one per beatIndex) rather than a shared/reused
// illustration — the illustration key doubles as the texture key
// directly, no separate lookup table needed.
export const STORY_PAGES = [
  { beatIndex: 0, illustration: 'beat1', lines: ["Dr Leonard Rizz, from Earth-13, has built something no one's ever seen before — a machine that can preserve a kueh forever."] },
  { beatIndex: 0, illustration: 'beat1', lines: ["He's invited Singapore's top chefs to bring their most iconic kuehs... to be the first ever preserved."] },

  { beatIndex: 1, illustration: 'beat2', lines: ['"This machine will keep our traditions alive — for all future humans," Dr Leonard announces proudly.'] },
  { beatIndex: 1, illustration: 'beat2', lines: ['One by one, the chefs place their kuehs onto the scanner.'] },

  { beatIndex: 2, illustration: 'beat3', lines: ['Outside, the sky begins to twist into something unnatural.'] },
  { beatIndex: 2, illustration: 'beat3', lines: ["The chefs exchange nervous glances. Something doesn't feel right."] },

  { beatIndex: 3, illustration: 'beat4', lines: ['A blinding flash — lightning tears through the sky and slams straight into the machine!'], effect: 'flash' },
  { beatIndex: 3, illustration: 'beat4', lines: ["Sparks fly. The scan… doesn't stop."] },

  { beatIndex: 4, illustration: 'beat5', lines: ['The kueh on the scanner begins to grow — swelling, twisting, rising to human size.'] },
  { beatIndex: 4, illustration: 'beat5', lines: ["It's alive. And it's hungry."] },

  { beatIndex: 5, illustration: 'beat6', lines: ["The lightning corrupted the machine's directive. \"Preserve\" became something else entirely."] },
  { beatIndex: 5, illustration: 'beat6', lines: ['Every kueh in the building has turned. The only way to stop this is to reach the machine — at the top floor.'] },
];

export const STORY_BEAT_COUNT = new Set(STORY_PAGES.map((p) => p.beatIndex)).size;
