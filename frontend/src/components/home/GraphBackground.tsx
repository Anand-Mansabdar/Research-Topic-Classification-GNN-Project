import { useEffect, useMemo, useRef } from "react";
import { animate, stagger } from "animejs";

interface Node {
  id: number;
  x: number;
  y: number;
  r: number;
  shade: string;
}

interface Edge {
  a: Node;
  b: Node;
}

// Deterministic pseudo-random so the layout doesn't reflow between renders/HMR.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NODE_SHADES = ["#FEF2F2", "#FFC9CA", "#FEA3A5", "#FB6E71", "#F34044", "#E12125"];
const NODE_COUNT = 46;
const MAX_EDGE_DIST = 17;

export function GraphBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { nodes, edges } = useMemo(() => {
    const rand = mulberry32(1729);
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, (_, id) => ({
      id,
      x: rand() * 100,
      y: rand() * 100,
      r: 1.4 + rand() * 2.2,
      shade: NODE_SHADES[Math.floor(rand() * NODE_SHADES.length)],
    }));

    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < MAX_EDGE_DIST && rand() > 0.55) {
          edges.push({ a: nodes[i], b: nodes[j] });
        }
      }
    }
    return { nodes, edges };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const circles = el.querySelectorAll<SVGCircleElement>("circle");
    const lines = el.querySelectorAll<SVGLineElement>("line");

    if (prefersReduced) {
      animate(circles, { opacity: 1, scale: 1, duration: 0 });
      animate(lines, { opacity: 0.5, duration: 0 });
      return;
    }

    animate(lines, { opacity: [0, 0.5], duration: 900, easing: "easeOutSine" });
    animate(circles, {
      opacity: [0, 1],
      scale: [0, 1],
      duration: 700,
      delay: stagger(14, { start: 200 }),
      easing: "easeOutBack",
    });

    // gentle ambient pulse, paused while the hero scrolls out of view
    const pulseAnim = animate(circles, {
      opacity: [{ to: 0.55 }, { to: 1 }],
      duration: 3200,
      delay: stagger(60),
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
      autoplay: false,
    });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) pulseAnim.play();
        else pulseAnim.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      pulseAnim.pause();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.a.x}
            y1={e.a.y}
            x2={e.b.x}
            y2={e.b.y}
            stroke="#FFC9CA"
            strokeWidth={0.12}
            opacity={0}
          />
        ))}
        {nodes.map((n) => (
          <circle key={n.id} cx={n.x} cy={n.y} r={n.r} fill={n.shade} opacity={0} />
        ))}
      </svg>
    </div>
  );
}
