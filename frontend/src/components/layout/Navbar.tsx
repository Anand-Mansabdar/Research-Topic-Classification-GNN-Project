import { Link, useLocation } from "react-router-dom";
import { HealthIndicator } from "@/components/predict/HealthIndicator";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-black text-white border-b border-white/10">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="block size-2.5 bg-brick-500 group-hover:bg-brick-400 transition-colors" />
          <span className="font-display text-lg tracking-tight">Cora Node Classifier</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              "px-3 py-2 text-sm transition-colors",
              location.pathname === "/" ? "text-white" : "text-white/55 hover:text-white"
            )}
          >
            About
          </Link>
          <Link
            to="/predict"
            className={cn(
              "px-3 py-2 text-sm transition-colors",
              location.pathname === "/predict" ? "text-white" : "text-white/55 hover:text-white"
            )}
          >
            Predict
          </Link>
          <div className="ml-3 pl-3 border-l border-white/15">
            <HealthIndicator />
          </div>
        </nav>
      </div>
    </header>
  );
}
