import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

const STEPS = [
  {
    title: "Start from the paper's own words",
    body: "Each node begins as its 1,433-length bag-of-words vector — what the paper itself says, nothing about its neighbors yet.",
  },
  {
    title: "Aggregate the neighborhood",
    body: "A graph convolution layer has every node collect and average the (transformed) feature vectors of the papers it cites and is cited by, mixing in a summary of the neighborhood.",
  },
  {
    title: "Stack layers, then classify",
    body: "Stacking a second convolution lets information travel two citations out. A final linear layer maps the resulting node vector to 7 logits, one per research area.",
  },
];

// center node + two hops of neighbors, laid out by hand for a clean radial diagram
const CENTER = { x: 150, y: 110 };
const HOP1 = [
  { x: 90, y: 55 },
  { x: 210, y: 55 },
  { x: 55, y: 130 },
  { x: 245, y: 130 },
];
const HOP2 = [
  { x: 60, y: 195 },
  { x: 150, y: 210 },
  { x: 240, y: 195 },
];

function GcnDiagram() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hop2Edges = svg.querySelectorAll<SVGLineElement>('[data-layer="edges-2"]');
    const hop1Edges = svg.querySelectorAll<SVGLineElement>('[data-layer="edges-1"]');
    const hop2Nodes = svg.querySelectorAll<SVGCircleElement>('[data-layer="nodes-2"]');
    const hop1Nodes = svg.querySelectorAll<SVGCircleElement>('[data-layer="nodes-1"]');
    const centerNode = svg.querySelectorAll<SVGCircleElement>('[data-layer="center"]');
    const outputBars = svg.querySelectorAll<SVGRectElement>('[data-layer="output"]');

    const allNodes = [...hop2Nodes, ...hop1Nodes, ...centerNode];
    const allEdges = [...hop2Edges, ...hop1Edges];

    if (prefersReduced) {
      animate([...allNodes, ...allEdges, ...outputBars], { opacity: 1, scale: 1, duration: 0 });
      return;
    }

    animate([...allNodes, ...outputBars], { opacity: 0, scale: 0.6, duration: 0 });
    animate(allEdges, { opacity: 0, duration: 0 });

    let observed = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed) {
          observed = true;
          const tl = animate(hop2Nodes, {
            opacity: [0, 1],
            scale: [0.6, 1],
            duration: 500,
            delay: stagger(90),
            easing: "easeOutBack",
          });
          animate(hop2Edges, { opacity: [0, 0.7], duration: 500, delay: 0 });

          setTimeout(() => {
            animate(hop1Edges, { opacity: [0, 0.9], duration: 450 });
            animate(hop1Nodes, {
              opacity: [0, 1],
              scale: [0.6, 1],
              duration: 500,
              delay: stagger(90),
              easing: "easeOutBack",
            });
          }, 500);

          setTimeout(() => {
            animate(centerNode, { opacity: [0, 1], scale: [0.5, 1], duration: 500, easing: "easeOutBack" });
          }, 1000);

          setTimeout(() => {
            animate(outputBars, {
              opacity: [0, 1],
              scaleX: [0, 1],
              duration: 500,
              delay: stagger(70),
              easing: "easeOutCubic",
            });
          }, 1450);

          void tl;
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 420 230" className="w-full h-auto max-w-md mx-auto" role="img" aria-label="Diagram of a graph convolutional network aggregating neighbor information toward a center paper node, then producing class output bars.">
      <g>
        {HOP2.map((n, i) => (
          <line key={i} data-layer="edges-2" x1={n.x} y1={n.y} x2={HOP1[i % HOP1.length].x} y2={HOP1[i % HOP1.length].y} stroke="#FFC9CA" strokeWidth={1.5} />
        ))}
        {HOP1.map((n) => (
          <line key={`h1-${n.x}`} data-layer="edges-1" x1={n.x} y1={n.y} x2={CENTER.x} y2={CENTER.y} stroke="#FEA3A5" strokeWidth={1.5} />
        ))}

        {HOP2.map((n, i) => (
          <circle key={i} data-layer="nodes-2" cx={n.x} cy={n.y} r={9} fill="#FFC9CA" />
        ))}
        {HOP1.map((n, i) => (
          <circle key={i} data-layer="nodes-1" cx={n.x} cy={n.y} r={11} fill="#FB6E71" />
        ))}
        <circle data-layer="center" cx={CENTER.x} cy={CENTER.y} r={15} fill="#E12125" />
      </g>

      <g transform="translate(300, 40)">
        <text x={0} y={-14} className="fill-white/60" fontSize={9} fontFamily="IBM Plex Mono, monospace">
          output
        </text>
        {Array.from({ length: 7 }).map((_, i) => (
          <g key={i} transform={`translate(0, ${i * 20})`}>
            <rect x={0} y={0} width={40} height={4} fill="#46090A" opacity={0.4} />
            <rect
              data-layer="output"
              x={0}
              y={0}
              height={4}
              width={i === 2 ? 40 : 8 + i * 3}
              fill={i === 2 ? "#F34044" : "#AA1A1D"}
              style={{ transformOrigin: "0px 2px" }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function ModelExplainer() {
  return (
    <section className="bg-black text-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight mb-10">
            How the model reads a citation graph
          </h2>
          <ol className="space-y-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="font-mono text-sm text-brick-400 pt-0.5 shrink-0">{`0${i + 1}`}</span>
                <div>
                  <h3 className="font-medium text-white mb-1.5">{step.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-brick-950/40 border border-white/10 p-8">
          <GcnDiagram />
        </div>
      </div>
    </section>
  );
}
