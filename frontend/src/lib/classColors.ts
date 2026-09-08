/**
 * The seven CORA topic classes, in class_id order, matching the backend's
 * CORA_CLASSES dict exactly (see /model_info). Note: the backend spells class 1
 * "Generic_Algorithms" — almost certainly a typo for "Genetic_Algorithms" — so
 * `label` below is kept byte-for-byte identical to what the API actually returns
 * (needed for lookups), while `display` renders the corrected, readable form.
 */
export interface CoraClassMeta {
  id: number;
  label: string; // raw string as returned by the backend — used as the lookup key
  display: string; // human-readable, typo-corrected text for the UI
  bg: string; // flat Tailwind background class from the brand palette
  text: string; // flat Tailwind text class with sufficient contrast on `bg`
}

export const CORA_CLASSES: CoraClassMeta[] = [
  { id: 0, label: "Case_Based", display: "Case-based", bg: "bg-brick-300", text: "text-black" },
  { id: 1, label: "Generic_Algorithms", display: "Genetic algorithms", bg: "bg-brick-500", text: "text-white" },
  { id: 2, label: "Neural_Networks", display: "Neural networks", bg: "bg-brick-700", text: "text-white" },
  { id: 3, label: "Probabilistic_Methods", display: "Probabilistic methods", bg: "bg-brick-900", text: "text-white" },
  { id: 4, label: "Reinforcement_Learning", display: "Reinforcement learning", bg: "bg-brick-600", text: "text-white" },
  { id: 5, label: "Rule_Learning", display: "Rule learning", bg: "bg-brick-800", text: "text-white" },
  { id: 6, label: "Theory", display: "Theory", bg: "bg-brick-950", text: "text-white" },
];

// Defensive lookup: keyed by both the raw backend label and a normalized
// (lowercased, underscore-insensitive) form, so a future backend typo fix
// ("Genetic_Algorithms") still resolves to the same entry.
const lookup = new Map<string, CoraClassMeta>();
for (const cls of CORA_CLASSES) {
  lookup.set(cls.label, cls);
  lookup.set(cls.label.toLowerCase(), cls);
}
lookup.set("genetic_algorithms", CORA_CLASSES[1]);

const FALLBACK: CoraClassMeta = {
  id: -1,
  label: "Unknown",
  display: "Unknown",
  bg: "bg-black",
  text: "text-white",
};

export function getClassMeta(label: string): CoraClassMeta {
  return lookup.get(label) ?? lookup.get(label.toLowerCase()) ?? { ...FALLBACK, label };
}

export function getClassMetaById(id: number): CoraClassMeta {
  return CORA_CLASSES.find((c) => c.id === id) ?? { ...FALLBACK, id };
}

export function formatClassLabel(label: string): string {
  return getClassMeta(label).display;
}
