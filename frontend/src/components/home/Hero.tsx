import { Link } from "react-router-dom";
import { GraphBackground } from "@/components/home/GraphBackground";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative bg-black text-white overflow-hidden">
      <GraphBackground />
      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-32 sm:pt-36 sm:pb-40">
        <p className="text-sm text-brick-300 tracking-wide mb-5">CORA · Planetoid citation network</p>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.05] max-w-3xl">
          A paper's neighbors tell you what it's about.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
          This model reads a scientific paper's word content alongside who it cites and who
          cites it back, then sorts it into one of seven machine-learning research areas —
          a graph convolutional network doing node classification on the CORA dataset.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link to="/predict">Classify a paper</Link>
          </Button>
          <a href="#what-is-cora" className="text-sm text-white/60 hover:text-white transition-colors">
            How does it work?
          </a>
        </div>
      </div>
    </section>
  );
}
