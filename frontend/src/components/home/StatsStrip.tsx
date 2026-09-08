import { useScrollReveal } from "@/hooks/useScrollReveal";

const STATS = [
  { value: "1,433", label: "input features per node", detail: "bag-of-words vector" },
  { value: "7", label: "output classes", detail: "research topic areas" },
  { value: "~2,700", label: "nodes in the CORA graph", detail: "citation network" },
  { value: "ONNX", label: "inference runtime", detail: "served on CPU" },
];

export function StatsStrip() {
  const ref = useScrollReveal<HTMLDivElement>({ childSelector: "[data-stat]", staggerDelay: 90 });

  return (
    <section className="bg-brick-50 py-20 border-b border-black/10">
      <div ref={ref} className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10 border border-black/10">
        {STATS.map((stat) => (
          <div key={stat.label} data-stat className="bg-brick-50 p-6 sm:p-8">
            <p className="font-display text-3xl sm:text-4xl font-medium tabular">{stat.value}</p>
            <p className="mt-2 text-sm text-black/80">{stat.label}</p>
            <p className="text-xs text-black/45 mt-0.5">{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
